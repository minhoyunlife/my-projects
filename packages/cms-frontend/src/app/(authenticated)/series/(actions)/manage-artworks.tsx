import { useState, useEffect } from "react";

import type { Series } from "@/src/app/(authenticated)/series/(actions)/update";
import {
  ArtworkSelect,
  type SelectedArtwork,
} from "@/src/components/(authenticated)/artwork-select";
import { Button } from "@/src/components/base/button";
import { useArtworks } from "@/src/hooks/artworks/use-artworks";
import { useSeries } from "@/src/hooks/series/use-series";
import { useToast } from "@/src/hooks/use-toast";
import { handleSeriesError } from "@/src/lib/utils/errors/series";

interface ManageSeriesArtworksFormProps {
  series: Series;
  onSuccess?: () => void;
}

export function ManageSeriesArtworksForm({
  series,
  onSuccess,
}: ManageSeriesArtworksFormProps) {
  const { toast } = useToast();

  const { useUpdateArtworks } = useSeries();
  const { useSearch } = useArtworks();

  const [searchTerm, setSearchTerm] = useState("");

  // 시리즈에 연결된 아트워크 목록 초기화
  const [selectedArtworks, setSelectedArtworks] = useState<SelectedArtwork[]>(
    series.seriesArtworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.translations.find((t) => t.language === "ko")?.title || "",
      order: artwork.order,
    })),
  );

  const { data: searchResults, isLoading } = useSearch(searchTerm);
  const [searchedArtworks, setSearchedArtworks] = useState<
    Array<{
      id: string;
      title: string;
      thumbnailUrl?: string;
    }>
  >([]);

  // 검색 결과를 상태로 관리
  useEffect(() => {
    if (searchResults?.data?.items) {
      setSearchedArtworks(
        searchResults.data.items.map((item) => ({
          id: item.id,
          title:
            item.translations.find((t) => t.language === "ko")?.title ||
            "제목 없음",
          // 아트워크에 썸네일 URL이 있다면 추가
          // thumbnailUrl: item.thumbnailUrl // API 응답에 따라 조정 필요
        })),
      );
    }
  }, [searchResults]);

  const updateArtworksMutation = useUpdateArtworks();

  const handleArtworkChange = (artworks: SelectedArtwork[]) => {
    setSelectedArtworks(artworks);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSubmit = async () => {
    try {
      await updateArtworksMutation.mutateAsync({
        seriesId: series.id,
        artworks: selectedArtworks.map((art) => ({
          id: art.id,
          order: art.order,
        })),
      });

      toast({
        title: "시리즈 아트워크가 업데이트되었습니다",
        variant: "success",
      });

      onSuccess?.();
    } catch (error) {
      handleSeriesError(
        error,
        toast,
        "시리즈 아트워크 업데이트 중 에러가 발생했습니다",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">시리즈-작품 연결</h3>
        <ArtworkSelect
          value={selectedArtworks}
          onChange={handleArtworkChange}
          onSearch={handleSearch}
          searchResults={searchedArtworks}
          isLoading={isLoading}
        />
      </div>

      <div className="pt-4">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={updateArtworksMutation.isPending}
        >
          {updateArtworksMutation.isPending
            ? "저장 중..."
            : "아트워크 구성 저장"}
        </Button>
      </div>
    </div>
  );
}
