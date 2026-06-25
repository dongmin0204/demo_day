import { useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import type { Medicine } from '@/types';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  results: Medicine[];
  onSelect: (medicine: Medicine) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function SearchInput({
  value,
  onChange,
  results,
  onSelect,
  placeholder = '약품명을 검색하세요',
  isLoading = false,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const showDropdown = isFocused && (results.length > 0 || isLoading) && value.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-2xl border border-[#ECEFF3] bg-white shadow-[0_12px_32px_-8px_rgba(16,24,40,0.16)]">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">검색 중...</div>
          ) : (
            <ul className="max-h-60 overflow-auto py-1">
              {results.map((medicine) => (
                <li key={medicine.id}>
                  <button
                    className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-50"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelect(medicine);
                    }}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {medicine.productName}
                    </p>
                    <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
