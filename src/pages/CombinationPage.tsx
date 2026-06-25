import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Loader2, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionCard } from '@/components/common/SectionCard';
import { MedicineCard } from '@/components/common/MedicineCard';
import { useMedicineContext } from '@/contexts/MedicineContext';
import { useAnalysis } from '@/hooks/useAnalysis';
import { foods } from '@/mock/foods';
import { supplements } from '@/mock/supplements';
import type { FoodItem, SupplementIngredient } from '@/types';

function ItemChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function AddSearchDialog<T extends { id: string }>({
  open,
  onOpenChange,
  title,
  placeholder,
  allItems,
  selectedIds,
  getLabel,
  getSubLabel,
  onAdd,
  filterItem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  allItems: T[];
  selectedIds: Set<string>;
  getLabel: (item: T) => string;
  getSubLabel?: (item: T) => string;
  onAdd: (item: T) => void;
  filterItem: (item: T, query: string) => boolean;
}) {
  const [query, setQuery] = useState('');
  const results = allItems.filter((item) =>
    query.trim() === '' ? true : filterItem(item, query.trim()),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { setQuery(''); onOpenChange(v); }}>
      <DialogContent className="rounded-2xl p-0">
        <div className="space-y-4 p-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {results.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">검색 결과가 없습니다.</p>
            ) : (
              results.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isSelected}
                    onClick={() => { onAdd(item); onOpenChange(false); setQuery(''); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'cursor-default opacity-40'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">{getLabel(item)}</span>
                      {getSubLabel && (
                        <span className="ml-2 text-xs text-gray-400">{getSubLabel(item)}</span>
                      )}
                    </div>
                    {isSelected ? (
                      <span className="text-xs text-gray-400">선택됨</span>
                    ) : (
                      <Plus className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CombinationPage() {
  const navigate = useNavigate();
  const { state: medicineState, dispatch: medicineDispatch } = useMedicineContext();
  const {
    selectedFoods,
    selectedSupplements,
    isAnalyzing,
    error,
    toggleFood,
    toggleSupplement,
    runAnalysis,
  } = useAnalysis();

  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  const [supplementDialogOpen, setSupplementDialogOpen] = useState(false);

  const selectedMedicines = medicineState.selectedMedicines;
  const selectedFoodIds = new Set(selectedFoods.map((f) => f.id));
  const selectedSupplementIds = new Set(selectedSupplements.map((s) => s.id));

  const totalSelectedCount =
    selectedMedicines.length + selectedFoods.length + selectedSupplements.length;
  const isFoodOnlySelection =
    selectedFoods.length > 0 &&
    selectedMedicines.length === 0 &&
    selectedSupplements.length === 0;
  const canAnalyze = totalSelectedCount >= 2 && !isFoodOnlySelection;

  const handleAnalyze = async () => {
    const success = await runAnalysis();
    if (success) navigate('/results');
  };

  return (
    <PageContainer title="조합 선택" showBackButton showBottomNav={false}>
      <div className="space-y-4 pb-24">
        {/* 약 섹션 */}
        <SectionCard title="복용 중인 약">
          {selectedMedicines.length === 0 ? (
            <p className="text-sm text-gray-400">선택된 약이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {selectedMedicines.map((med) => (
                <MedicineCard
                  key={med.id}
                  medicine={med}
                  onRemove={(id) => medicineDispatch({ type: 'REMOVE_MEDICINE', payload: id })}
                  selected
                />
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl"
            onClick={() => navigate('/add-medicine')}
          >
            <Plus className="mr-1 h-4 w-4" />
            약 추가
          </Button>
        </SectionCard>

        {/* 음식 섹션 */}
        <SectionCard title="함께 먹는 음식">
          <div className="flex flex-wrap gap-2">
            {foods.map((food) => (
              <ItemChip
                key={food.id}
                label={food.name}
                selected={selectedFoodIds.has(food.id)}
                onToggle={() => toggleFood(food)}
              />
            ))}
            <button
              type="button"
              onClick={() => setFoodDialogOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600"
            >
              <Plus className="h-3.5 w-3.5" />
              직접 추가
            </button>
          </div>
        </SectionCard>

        {/* 영양제 섹션 */}
        <SectionCard title="복용 중인 영양제">
          <div className="flex flex-wrap gap-2">
            {supplements.map((sup) => (
              <ItemChip
                key={sup.id}
                label={sup.nameKo}
                selected={selectedSupplementIds.has(sup.id)}
                onToggle={() => toggleSupplement(sup)}
              />
            ))}
            <button
              type="button"
              onClick={() => setSupplementDialogOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600"
            >
              <Plus className="h-3.5 w-3.5" />
              직접 추가
            </button>
          </div>
        </SectionCard>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-sm text-red-700">{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Bottom fixed button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#EFEFF1] bg-[#FBFBFC]/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-lg px-1">
          <Button
            className="h-[52px] w-full rounded-2xl text-[15px] font-semibold"
            disabled={!canAnalyze || isAnalyzing}
            onClick={handleAnalyze}
          >
            상호작용 분석하기
          </Button>
        </div>
      </div>

      {/* 분석 중 로딩 모달 */}
      <Dialog open={isAnalyzing} onOpenChange={() => {}}>
        <DialogContent
          className="flex flex-col items-center gap-5 rounded-2xl px-8 py-10 text-center [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <Loader2 className="h-10 w-10 animate-spin text-foreground" />
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">분석 중이에요</p>
            <p className="text-sm text-gray-500">상호작용을 확인하고 있어요. 잠시만 기다려 주세요.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 음식 검색 다이얼로그 */}
      <AddSearchDialog<FoodItem>
        open={foodDialogOpen}
        onOpenChange={setFoodDialogOpen}
        title="음식 검색"
        placeholder="음식 이름으로 검색 (예: 자몽, 커피)"
        allItems={foods}
        selectedIds={selectedFoodIds}
        getLabel={(f) => f.name}
        getSubLabel={(f) => f.group}
        onAdd={toggleFood}
        filterItem={(f, q) =>
          f.name.includes(q) ||
          f.group.includes(q) ||
          f.aliases.some((a) => a.includes(q))
        }
      />

      {/* 영양제 검색 다이얼로그 */}
      <AddSearchDialog<SupplementIngredient>
        open={supplementDialogOpen}
        onOpenChange={setSupplementDialogOpen}
        title="영양제 검색"
        placeholder="영양제 성분명으로 검색 (예: 철분, 오메가3)"
        allItems={supplements}
        selectedIds={selectedSupplementIds}
        getLabel={(s) => s.nameKo}
        getSubLabel={(s) => s.category}
        onAdd={toggleSupplement}
        filterItem={(s, q) =>
          s.nameKo.includes(q) ||
          s.nameEn.toLowerCase().includes(q.toLowerCase()) ||
          s.category.includes(q) ||
          s.aliases.some((a) => a.toLowerCase().includes(q.toLowerCase()))
        }
      />
    </PageContainer>
  );
}
