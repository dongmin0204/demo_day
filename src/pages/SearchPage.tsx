import { useEffect, useState } from 'react';
import { Camera, Pill, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchInput } from '@/components/common/SearchInput';
import { useMedicineContext } from '@/contexts/MedicineContext';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import type { Medicine } from '@/types';

function InfoSearchPage({ onOcr }: { onOcr: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ocrState = location.state as
    | { recognizedMedicines?: Medicine[]; viewedMedicine?: Medicine | null }
    | null;
  const { state: medicineState, dispatch: medicineDispatch } = useMedicineContext();
  const { query, results, isSearching, setQuery } = useMedicineSearch();

  useEffect(() => () => { setQuery(''); }, [setQuery]);

  const [viewedMedicine, setViewedMedicine] = useState<Medicine | null>(
    () => ocrState?.viewedMedicine ?? ocrState?.recognizedMedicines?.[0] ?? null,
  );
  const [ocrMedicines, setOcrMedicines] = useState<Medicine[]>(
    () => ocrState?.recognizedMedicines ?? [],
  );

  const handleAddToAnalysis = (medicine: Medicine) => {
    const alreadyAdded = medicineState.selectedMedicines.some((m) => m.id === medicine.id);
    if (alreadyAdded) {
      toast('이미 분석 목록에 있는 약이에요.');
      return;
    }
    medicineDispatch({ type: 'ADD_MEDICINE', payload: medicine });
    toast('분석 목록에 추가했어요.', {
      description: `${medicine.productName}을(를) 조합 분석에 넣었습니다.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          results={results}
          onSelect={(medicine) => { setViewedMedicine(medicine); setQuery(''); }}
          isLoading={isSearching}
          placeholder="약품명, 제조사, 성분명으로 검색"
        />
        <button
          type="button"
          onClick={onOcr}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
        >
          <Camera className="h-4 w-4" />
          처방전 촬영으로 검색하기
        </button>
      </div>

      {ocrMedicines.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              촬영으로 인식된 약 ({ocrMedicines.length}개)
            </p>
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setOcrMedicines([])}
            >
              닫기
            </button>
          </div>
          {ocrMedicines.map((medicine) => (
            <Card key={medicine.id} className="border-gray-200">
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{medicine.productName}</p>
                  <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setViewedMedicine(medicine)}>
                  정보 보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewedMedicine ? (
        <Card className="border-gray-200">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{viewedMedicine.productName}</p>
                <p className="mt-0.5 text-sm text-gray-500">{viewedMedicine.manufacturer}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-xs text-gray-400 hover:text-gray-600"
                onClick={() => setViewedMedicine(null)}
              >
                닫기
              </button>
            </div>
            {viewedMedicine.indication && (
              <div className="rounded-xl bg-gray-100 p-3">
                <p className="text-xs font-medium text-foreground">주요 용도</p>
                <p className="mt-1 text-sm text-gray-800">{viewedMedicine.indication}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">제형</p>
                <p className="mt-1 text-sm text-foreground">{viewedMedicine.dosageForm}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">구분</p>
                <p className="mt-1 text-sm text-foreground">{viewedMedicine.classification}</p>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">성분 정보</p>
              <div className="mt-2 space-y-1">
                {viewedMedicine.ingredients.map((ingredient) => (
                  <p key={ingredient.ingredient.id} className="text-sm text-foreground">
                    {ingredient.ingredient.nameKo} {ingredient.amount}{ingredient.unit}
                    {ingredient.isMain && <span className="ml-1 text-xs text-foreground">주성분</span>}
                  </p>
                ))}
              </div>
            </div>
            <Button className="h-12 w-full rounded-2xl text-[15px] font-semibold" onClick={() => handleAddToAnalysis(viewedMedicine)}>
              분석에 추가
            </Button>
          </CardContent>
        </Card>
      ) : query && !isSearching && results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">검색 결과가 없어요</p>
          <p className="text-xs text-gray-400">약품명, 제조사, 성분명을 다시 확인해보세요</p>
        </div>
      ) : !query && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Pill className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">약 이름으로 검색해보세요</p>
            <p className="mt-1 text-xs text-gray-400">성분, 제형 등 상세 정보를 확인할 수 있어요</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/combine')}
            className="mt-1 flex items-center gap-1 text-xs text-foreground hover:underline"
          >
            분석 화면으로 이동
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();

  return (
    <PageContainer title="약 검색" showBackButton showBottomNav>
      <InfoSearchPage onOcr={() => navigate('/ocr?mode=search')} />
    </PageContainer>
  );
}
