import { X, Plus } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import type { Medicine } from '@/types';

interface MedicineCardProps {
  medicine: Medicine;
  onSelect?: (medicine: Medicine) => void;
  onRemove?: (id: string) => void;
  selected?: boolean;
}

export function MedicineCard({
  medicine,
  onSelect,
  onRemove,
  selected = false,
}: MedicineCardProps) {
  const mainIngredient = medicine.ingredients.find((i) => i.isMain);

  return (
    <Card
      className={`transition-colors ${
        selected ? 'border-gray-400 bg-[#F4F4F5]' : 'hover:border-gray-300'
      }`}
    >
      <CardContent className="flex items-center justify-between p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">
            {medicine.productName}
          </p>
          <p className="text-sm text-gray-500">{medicine.manufacturer}</p>
          {mainIngredient && (
            <p className="text-xs text-gray-400">
              {mainIngredient.ingredient.nameKo} {mainIngredient.amount}
              {mainIngredient.unit}
            </p>
          )}
        </div>
        <div className="ml-2 flex-shrink-0">
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(medicine.id)}
              aria-label="제거"
              className="h-8 w-8 text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {onSelect && !selected && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSelect(medicine)}
              aria-label="추가"
              className="h-8 w-8 text-gray-400 hover:text-gray-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
