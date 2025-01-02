import type { FilterOption } from "@/src/components/(authenticated)/filter/filter-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/base/select";

export interface SortProps<TValue = string> {
  options: FilterOption[];
  onSort: (value: TValue) => void;
}

export function SortSelect<TValue>(sortProps: SortProps<TValue>) {
  return (
    <div className="w-48">
      <Select onValueChange={(value) => sortProps.onSort(value as TValue)}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="정렬 기준" />
        </SelectTrigger>
        <SelectContent>
          {sortProps.options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
