import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Camera, Upload, Check, AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { PageContainer } from '@/components/layout/PageContainer';
import { useMedicineContext } from '@/contexts/MedicineContext';
import { uploadPrescription, type OcrResult } from '@/services/ocrService';

export default function OcrPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useMedicineContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResults, setOcrResults] = useState<OcrResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mode = searchParams.get('mode');
  const isSearchMode = mode === 'search';

  const pageTitle = isSearchMode ? '처방전으로 약 검색' : '처방전 인식';
  const helperText = isSearchMode
    ? '촬영 후 인식된 약을 확인하고 약 정보를 볼 수 있어요.'
    : '촬영 후 인식된 약을 분석 목록에 추가할 수 있어요.';

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('JPG 또는 PNG 이미지 파일만 지원합니다.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const results = await uploadPrescription(file);
      clearInterval(progressInterval);
      setProgress(100);
      setOcrResults(results);
    } catch {
      clearInterval(progressInterval);
      setError('처방전 인식에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveResult = (index: number) => {
    if (!ocrResults) return;
    setOcrResults(ocrResults.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (!ocrResults) return;

    if (isSearchMode) {
      navigate('/search', {
        replace: true,
        state: {
          recognizedMedicines: ocrResults.map((result) => result.medicine),
          viewedMedicine: ocrResults[0]?.medicine ?? null,
        },
      });
      return;
    }

    for (const result of ocrResults) {
      dispatch({ type: 'ADD_MEDICINE', payload: result.medicine });
    }
    navigate('/combine');
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          <Check className="h-3 w-3" /> 인식 완료
        </span>
      );
    }
    if (confidence >= 0.7) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
          <AlertTriangle className="h-3 w-3" /> 확인 필요
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <AlertTriangle className="h-3 w-3" /> 수정 필요
      </span>
    );
  };

  return (
    <PageContainer title={pageTitle} showBackButton showBottomNav={false}>
      <div className="space-y-4">
        <div className="rounded-xl border border-[#EFEFF1] bg-gray-100 px-4 py-3">
          <p className="text-sm leading-relaxed text-gray-700">{helperText}</p>
        </div>

        {/* Upload area */}
        {!ocrResults && !isUploading && (
          <div
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 text-center transition-colors hover:border-gray-400"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Camera className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                처방전 또는 약봉투 사진을 업로드하세요
              </p>
              <p className="mt-1 text-sm text-gray-400">JPG, PNG 지원</p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              파일 선택
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
        )}

        {/* Loading state */}
        {isUploading && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <Loader2 className="h-10 w-10 animate-spin text-gray-700" />
              <p className="font-medium text-gray-700">인식 중...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-400">{progress}%</p>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setError(null);
                  fileInputRef.current?.click();
                }}
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {/* OCR Results */}
        {ocrResults && (
          <>
            <p className="text-sm font-medium text-gray-700">
              인식 결과 ({ocrResults.length}개)
            </p>
            <div className="space-y-2">
              {ocrResults.map((result, index) => (
                <Card key={result.medicine.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-foreground">
                          {result.medicine.productName}
                        </p>
                        {getConfidenceBadge(result.confidence)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {result.medicine.manufacturer}
                      </p>
                      <p className="text-xs text-gray-400">
                        신뢰도: {Math.round(result.confidence * 100)}%
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveResult(index)}
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-2xl"
                onClick={() => {
                  setOcrResults(null);
                  setProgress(0);
                }}
              >
                다시 촬영
              </Button>
              <Button
                className="h-12 flex-1 rounded-2xl text-[15px] font-semibold"
                onClick={handleConfirm}
                disabled={ocrResults.length === 0}
              >
                {isSearchMode
                  ? `약 정보 확인 (${ocrResults.length}개)`
                  : `약 목록 확정 (${ocrResults.length}개)`}
              </Button>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
