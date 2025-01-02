import { Search } from "lucide-react";

import { Input } from "@/src/components/base/input";

export interface SearchProps {
  placeholder: string;
  onSearch: (value: string) => void;
}

export function SearchBar(searchProps: SearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={searchProps.placeholder}
        className="pl-8"
        onChange={(e) => searchProps.onSearch(e.target.value)}
      />
    </div>
  );
}
