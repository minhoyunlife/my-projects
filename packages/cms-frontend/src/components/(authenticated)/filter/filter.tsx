import { X } from "lucide-react";

import type { FilterOption } from "@/src/components/(authenticated)/filter/filter-container";
import { Badge } from "@/src/components/base/badge";
import { Button } from "@/src/components/base/button";
import { Checkbox } from "@/src/components/base/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/base/dropdown-menu";
import { Input } from "@/src/components/base/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/base/popover";
import { Spinner } from "@/src/components/common/spinner";

export interface FilterProps<TValue extends string | number = string> {
  id: string;
  type: "dropdown-checkbox" | "combobox";
  label: string;
  options: FilterOption<TValue>[];
  selectedOptions?: FilterOption<TValue>[];
  value: TValue[];
  onChange: (values: TValue[]) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  isLoading?: boolean;
}

function DropdownCheckboxFilter<TValue extends string | number>({
  options,
  value,
  onChange,
  ...props
}: FilterProps<TValue>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[120px]"
        >
          {props.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={String(option.value)}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => {
              const newValues = checked
                ? [...value, option.value]
                : value.filter((v) => v !== option.value);
              onChange(newValues);
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ComboboxFilter<TValue extends string | number>({
  options,
  selectedOptions = [],
  value,
  onChange,
  searchValue = "",
  onSearch,
  isLoading,
  ...props
}: FilterProps<TValue>) {
  const getSelectedLabel = (selectedValue: TValue) => {
    return (
      selectedOptions.find((opt) => opt.value === selectedValue)?.label ||
      options.find((opt) => opt.value === selectedValue)?.label ||
      ""
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[120px]"
        >
          {props.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[300px]"
        align="start"
      >
        <div className="space-y-2 p-3">
          {/* 선택된 항목의 칩 */}
          {value.length > 0 && (
            <div
              className="flex flex-wrap gap-2 pb-2"
              data-testid="selected-chips"
            >
              {value.map((selectedValue) => {
                return (
                  <Badge
                    key={String(selectedValue)}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getSelectedLabel(selectedValue)}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      data-testid="chip-delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(value.filter((v) => v !== selectedValue));
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* 검색 창 */}
          <Input
            placeholder={`${props.label} 검색...`}
            className="w-full"
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
          />

          {/* 검색 결과 */}
          <div
            className="max-h-[300px] overflow-auto"
            data-testid="options-container"
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Spinner size={12} />
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                검색 결과가 없습니다
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={String(option.value)}
                  className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                  onClick={() => {
                    const newValues = value.includes(option.value)
                      ? value.filter((v) => v !== option.value)
                      : [...value, option.value];
                    onChange(newValues);
                  }}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    className="pointer-events-none"
                  />
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FilterSwitcher<TValue extends string | number>(
  props: FilterProps<TValue>,
) {
  return props.type === "dropdown-checkbox" ? (
    <DropdownCheckboxFilter<TValue> {...props} />
  ) : (
    <ComboboxFilter<TValue> {...props} />
  );
}
