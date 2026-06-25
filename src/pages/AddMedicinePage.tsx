import { useEffect, useRef, useState } from 'react';
import { Camera, Plus, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchInput } from '@/components/common/SearchInput';
import { MedicineCard } from '@/components/common/MedicineCard';
import { useMedicineContext } from '@/contexts/MedicineContext';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import { uploadPrescription, type OcrResult } from '@/services/ocrService';
import type { Medicine } from '@/types';

export default function AddMedicinePage() {
  const navigate = useNavigate();
  const { state: medicineState, dispatch: medicineDispatch } = useMedicineContext();
  const { query, results, isSearching, setQuery } = useMedicineSearch();

  useEffect(() => () => { setQuery(''); }, [setQuery]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [ocrError, setOcrError] = useState(false);

  const selectedIds = new Set(medicineState.selectedMedicines.map((m) => m.id));

  const handleSelect = (medicine: Medicine) => {
    if (selectedIds.has(medicine.id)) {
      toast('이미 추가된 약이에요.');
      return;
    }
    medicineDispatch({ type: 'ADD_MEDICINE', payload: medicine });
    setQuery('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setOcrLoading(true);
    setOcrError(false);
    setOcrResults([]);
    try {
      const results = await uploadPrescription(file);
      setOcrResults(results);
    } catch {
      setOcrError(true);
    } finally {
      setOcrLoading(false);
    }
  };

  const addOcrMedicine = (medicine: Medicine) => {
    if (selectedIds.has(medicine.id)) return;
    medicineDispatch({ type: 'ADD_MEDICINE', payload: medicine });
  };

  return (
    <PageContainer title="약 추가" showBackButton showBottomNav={false}>
      <div className="space-y-4 pb-24">
        {medicineState.selectedMedicines.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              분석 목록 ({medicineState.selectedMedicines.length}개)
            </p>
            {medicineState.selectedMedicines.map((med) => (
              <MedicineCard
                key={med.id}
                medicine={med}
                onRemove={(id) => medicineDispatch({ type: 'REMOVE_MEDICINE', payload: id })}
                selected
              />
            ))}
          </div>
        )}

        <SearchInput
          value={query}
          onChange={setQuery}
          results={results}
          onSelect={handleSelect}
          isLoading={isSearching}
          placeholder="추가할 약 이름으로 검색"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={ocrLoading}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:opacity-50"
        >
          {ocrLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />처방전 인식 중...</>
            : <><Camera className="h-4 w-4" />처방전 촬영으로 추가하기</>
          }
        </button>

        {ocrError && (
          <p className="flex items-center gap-1.5 text-sm text-red-500">
            <AlertTriangle className="h-4 w-4" />
            인식에 실패했어요. 다시 시도해 주세요.
          </p>
        )}

        {ocrResults.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">촬영으로 인식된 약 — 탭해서 추가하세요</p>
            {ocrResults.map((result) => {
              const isAdded = selectedIds.has(result.medicine.id);
              return (
                <button
                  key={result.medicine.id}
                  type="button"
                  disabled={isAdded}
                  onClick={() => addOcrMedicine(result.medicine)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                    isAdded ? 'opacity-40' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-foreground">
                      {result.medicine.productName}
                    </p>
                    <p className="text-xs text-gray-500">{result.medicine.manufacturer}</p>
                  </div>
                  {isAdded
                    ? <Check className="h-4 w-4 shrink-0 text-gray-700" />
                    : <Plus className="h-4 w-4 shrink-0 text-gray-400" />
                  }
                </button>
              );
            })}
          </div>
        )}

        {query && !isSearching && results.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm font-medium text-gray-500">검색 결과가 없어요</p>
            <p className="text-xs text-gray-400">약품명, 제조사, 성분명을 다시 확인해보세요</p>
          </div>
        )}

        {!query && medicineState.selectedMedicines.length === 0 && ocrResults.length === 0 && !ocrLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Plus className="h-7 w-7 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">추가할 약을 검색하세요</p>
              <p className="mt-1 text-xs text-gray-400">검색 후 선택하면 분석 목록에 바로 추가돼요</p>
            </div>
          </div>
        )}

        {medicineState.selectedMedicines.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-[#EFEFF1] bg-[#FBFBFC]/95 p-4 backdrop-blur">
            <div className="mx-auto max-w-lg">
              <Button className="h-[52px] w-full rounded-2xl text-[15px] font-semibold" onClick={() => navigate('/combine')}>
                분석 화면으로 돌아가기 ({medicineState.selectedMedicines.length})
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
