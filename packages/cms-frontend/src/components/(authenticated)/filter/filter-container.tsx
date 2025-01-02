"use client";

import type { FilterProps } from "@/src/components/(authenticated)/filter/filter";
import { FilterSwitcher } from "@/src/components/(authenticated)/filter/filter";
import type { SearchProps } from "@/src/components/(authenticated)/filter/search-bar";
import { SearchBar } from "@/src/components/(authenticated)/filter/search-bar";
import type { SortProps } from "@/src/components/(authenticated)/filter/sort-select";
import { SortSelect } from "@/src/components/(authenticated)/filter/sort-select";

export interface FilterOption<TValue extends string | number = string> {
  label: string;
  value: TValue;
}

export interface FilterContainerProps<
  TFilterValue extends string | number = string,
  TSortValue extends string | number = string,
> {
  searchProps?: SearchProps;
  filterProps?: FilterProps<TFilterValue>[];
  sortProps?: SortProps<TSortValue>;
}

export function FilterContainer<
  TFilterValue extends string | number = string,
  TSortValue extends string | number = string,
>({
  searchProps,
  filterProps,
  sortProps,
}: FilterContainerProps<TFilterValue, TSortValue>) {
  return (
    <div className="flex items-center gap-4 py-3">
      {searchProps && <SearchBar {...searchProps} />}

      {filterProps?.map((filter) => (
        <FilterSwitcher<TFilterValue>
          key={filter.id}
          {...filter}
        />
      ))}

      {sortProps && <SortSelect<TSortValue> {...sortProps} />}
    </div>
  );
}
