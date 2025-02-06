import { useEffect, useState } from "react";

import { ChevronDown, X } from "lucide-react";

import type { Genre } from "@/src/app/(authenticated)/genres/(actions)/update";
import { Badge } from "@/src/components/base/badge";
import { Button } from "@/src/components/base/button";
import { Checkbox } from "@/src/components/base/checkbox";
import { Input } from "@/src/components/base/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/base/popover";
import { Spinner } from "@/src/components/common/spinner";
import { useGenres } from "@/src/hooks/genres/use-genres";

interface GenreSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  defaultGenres?: Genre[];
  disabled?: boolean;
  error?: string;
}

export function GenreSelect({
  value,
  onChange,
  defaultGenres = [],
  disabled = false,
  error,
}: GenreSelectProps) {
  const [search, setSearch] = useState("");

  const [selectedGenreDetails, setSelectedGenreDetails] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);

  const { useSearch } = useGenres();
  const { data: searchResults, isLoading } = useSearch(search);

  useEffect(() => {
    if (defaultGenres.length > 0) {
      setSelectedGenreDetails(
        defaultGenres.map((genre) => ({
          id: genre.id,
          name: genre.translations.find((t) => t.language === "ko")?.name || "",
        })),
      );
    }
  }, []);

  const handleGenreToggle = (genre: Genre) => {
    const newValue = value.includes(genre.id)
      ? value.filter((id) => id !== genre.id)
      : [...value, genre.id];

    onChange(newValue);

    if (!value.includes(genre.id)) {
      setSelectedGenreDetails((prev) => [
        ...prev,
        {
          id: genre.id,
          name: genre.translations.find((t) => t.language === "ko")?.name || "",
        },
      ]);
    } else {
      setSelectedGenreDetails((prev) => prev.filter((g) => g.id !== genre.id));
    }
  };

  return (
    <div className="space-y-2">
      {/* 선택된 장르 배지 표시 */}
      {selectedGenreDetails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenreDetails.map((genre) => (
            <Badge
              key={genre.id}
              variant="secondary"
              className="gap-1"
            >
              {genre.name}
              {!disabled && (
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    onChange(value.filter((id) => id !== genre.id));
                    setSelectedGenreDetails((prev) =>
                      prev.filter((g) => g.id !== genre.id),
                    );
                  }}
                />
              )}
            </Badge>
          ))}
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="outline"
            className="w-full justify-between"
          >
            <span>장르 선택</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-3">
          <div className="space-y-4">
            {/* 검색 입력 */}
            <Input
              placeholder="장르 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* 검색 결과 */}
            <div className="max-h-[200px] overflow-auto space-y-1">
              {isLoading ? (
                <div className="flex justify-center p-2">
                  <Spinner size={12} />
                </div>
              ) : searchResults?.data?.items.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground p-2">
                  검색 결과가 없습니다
                </div>
              ) : (
                searchResults?.data?.items.map((genre) => (
                  <div
                    key={genre.id}
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => handleGenreToggle(genre)}
                  >
                    <Checkbox checked={value.includes(genre.id)} />
                    <span>
                      {
                        genre.translations.find((t) => t.language === "ko")
                          ?.name
                      }
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
