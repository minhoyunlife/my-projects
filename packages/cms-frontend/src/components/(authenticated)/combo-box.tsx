import { useState, useRef, useEffect } from "react";

import { Command } from "cmdk";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@/src/components/base/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/base/popover";
import { cn } from "@/src/lib/utils/tailwindcss/utils";

export interface ComboBoxItem {
  value: string;
  label: string;
}

interface ComboBoxProps {
  items: ComboBoxItem[];
  placeholder?: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSelect: (value: string, label: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ComboBox({
  items,
  placeholder = "검색...",
  inputValue,
  onInputChange,
  onSelect,
  isLoading = false,
  disabled = false,
}: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {inputValue ? (
            <span className="truncate">{inputValue}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
      >
        <Command className="w-full">
          <div className="flex items-center border-b px-3">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={placeholder}
            />
          </div>
          <Command.List>
            {isLoading ? (
              <div className="py-6 text-center text-sm">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-6 text-center text-sm">검색 결과가 없습니다.</p>
            ) : (
              <div className="max-h-[300px] overflow-auto py-2">
                {items.map((item) => (
                  <div
                    key={item.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent",
                    )}
                    onClick={() => {
                      onSelect(item.value, item.label);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 opacity-0",
                        inputValue === item.label && "opacity-100",
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
