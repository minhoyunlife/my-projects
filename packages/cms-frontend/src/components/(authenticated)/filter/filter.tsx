import type { FilterOption } from "@/src/components/(authenticated)/filter/filter-container";
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

export interface FilterProps<TValue extends string | number = string> {
  id: string;
  type: "dropdown-checkbox" | "combobox";
  label: string;
  options: FilterOption<TValue>[];
  value: TValue[];
  onChange: (values: TValue[]) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
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
  value,
  onChange,
  searchValue,
  onSearch,
  ...props
}: FilterProps<TValue>) {
  const filteredOptions = searchValue
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : options;

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
        className="p-0"
        align="start"
      >
        <div className="space-y-2 p-3">
          <Input
            placeholder={`${props.label} 검색...`}
            className="w-full"
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <div className="max-h-[300px] overflow-auto">
            {filteredOptions.map((option) => (
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
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...value, option.value]
                      : value.filter((v) => v !== option.value);
                    onChange(newValues);
                  }}
                  className="pointer-events-none"
                />
                <span>{option.label}</span>
              </div>
            ))}
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
