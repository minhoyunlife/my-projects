import { useEffect, useState } from "react";

import { X } from "lucide-react";

import type { Genre } from "@/src/app/(authenticated)/genres/(actions)/update";
import { ComboBox } from "@/src/components/(authenticated)/combo-box";
import { Badge } from "@/src/components/base/badge";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenreDetails, setSelectedGenreDetails] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);

  const { useSearch } = useGenres();
  const { data: searchResults, isLoading } = useSearch(searchTerm);

  // 초기 장르 목록 설정
  useEffect(() => {
    if (defaultGenres.length > 0) {
      setSelectedGenreDetails(
        defaultGenres.map((genre) => ({
          id: genre.id,
          name: genre.translations.find((t) => t.language === "ko")?.name || "",
        })),
      );
    }
  }, [defaultGenres]);

  // 검색어 변경 핸들러
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // 장르 선택 핸들러
  const handleGenreSelect = (genreId: string, genreName: string) => {
    // 이미 선택된 장르인지 확인
    if (value.includes(genreId)) {
      return;
    }

    // 장르 추가
    const newValue = [...value, genreId];
    onChange(newValue);

    // 장르 상세 정보 추가
    setSelectedGenreDetails((prev) => [
      ...prev,
      { id: genreId, name: genreName },
    ]);

    // 검색어 초기화
    setSearchTerm("");
  };

  // 장르 제거 핸들러
  const handleGenreRemove = (genreId: string) => {
    // 선택된 장르에서 제거
    const newValue = value.filter((id) => id !== genreId);
    onChange(newValue);

    // 장르 상세 정보에서 제거
    setSelectedGenreDetails((prev) => prev.filter((g) => g.id !== genreId));
  };

  return (
    <div className="space-y-4">
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
                  onClick={() => handleGenreRemove(genre.id)}
                />
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* 장르 검색 콤보 박스 */}
      <ComboBox
        items={
          searchResults?.data?.items.map((genre) => ({
            value: genre.id,
            label:
              genre.translations.find((t) => t.language === "ko")?.name ||
              "이름 없음",
          })) || []
        }
        placeholder="장르 검색..."
        inputValue={searchTerm}
        onInputChange={handleSearchChange}
        onSelect={handleGenreSelect}
        isLoading={isLoading}
        disabled={disabled}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
