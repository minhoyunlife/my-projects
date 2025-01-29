"use client";

import { useEffect, useMemo, useState } from "react";

import {
  GetArtworksPlatformsEnum,
  GetArtworksSortEnum,
  GetArtworksStatusEnum,
} from "@minhoyunlife/my-ts-client";
import { Trash2 } from "lucide-react";

import { CreateArtworkForm } from "@/src/app/(authenticated)/fanarts/(actions)/(create)/create";
import { DeleteArtworkDialog } from "@/src/app/(authenticated)/fanarts/(actions)/delete";
import { artworkColumns } from "@/src/app/(authenticated)/fanarts/columns";
import { ActionButton } from "@/src/components/(authenticated)/action-button";
import { artworkSkeletonColumns } from "@/src/components/(authenticated)/data-table/skeleton";
import { DataTable } from "@/src/components/(authenticated)/data-table/table";
import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";
import { PageWrapper } from "@/src/components/(authenticated)/page-wrapper";
import { SelectionActionBar } from "@/src/components/(authenticated)/selected-action-bar";
import { SlideOver } from "@/src/components/(authenticated)/slide-over";
import { useArtworks } from "@/src/hooks/artworks/use-artworks";
import { useGenres } from "@/src/hooks/genres/use-genres";
import { useToast } from "@/src/hooks/use-toast";

export default function FanartsListPage() {
  const { toast } = useToast();
  const { useList } = useArtworks();
  const { useSearch } = useGenres();

  // 페이징 및 필터 관련
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [platforms, setPlatforms] = useState<GetArtworksPlatformsEnum[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState<string>("");
  const [selectedGenreInfos, setSelectedGenreInfos] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >([]);
  const [status, setStatus] = useState<GetArtworksStatusEnum[]>([]);
  const [sort, setSort] = useState<GetArtworksSortEnum>();

  // 작품 추가 슬라이드오버 관련
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 행 선택 및 삭제 관련
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: artworksResult,
    isLoading: isArtworksLoading,
    error,
  } = useList({
    search,
    genres,
    platforms,
    sort,
    page,
    status,
  });

  const { data: genreSearchResult, isLoading: isGenreSearchLoading } =
    useSearch(genreSearch);

  const genreOptions = useMemo(
    () =>
      genreSearchResult?.data.items.map((genre) => ({
        value: genre.id,
        label: genre.translations.find((t) => t.language === "ko")?.name || "",
      })) ?? [],
    [genreSearchResult],
  );

  const handleSingleDelete = (id: string) => {
    setSelectedArtworkIds([id]);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "에러 발생",
        description: "작품 목록을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [error]);

  const handleSearch = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  const handlePlatformChange = (values: string[]) => {
    setPage(1);
    setPlatforms(values as GetArtworksPlatformsEnum[]);
  };

  const handleGenreChange = (values: string[]) => {
    setPage(1);
    setGenres(values);

    const newInfos = values.map((value) => {
      const existing = selectedGenreInfos.find((info) => info.value === value);
      if (existing) return existing;

      const newInfo = genreOptions.find((opt) => opt.value === value);
      if (newInfo) return newInfo;

      return { value, label: "" };
    });

    setSelectedGenreInfos(newInfos);
  };

  const handleStatusChange = (values: string[]) => {
    setPage(1);
    setStatus(values as GetArtworksStatusEnum[]);
  };

  const handleSort = (value: GetArtworksSortEnum) => {
    setPage(1);
    setSort(value);
  };

  return (
    <PageWrapper title="팬아트 작품 목록">
      {/* 행 선택 후 상단에 표시할 액션 바 */}
      {selectedArtworkIds.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedArtworkIds.length}
          itemLabel="작품"
          actions={[
            {
              label: "삭제",
              icon: Trash2,
              variant: "destructive",
              onClick: () => setIsDeleteDialogOpen(true),
            },
          ]}
        />
      )}

      {/* 작품 삭제 확인 다이얼로그 */}
      <DeleteArtworkDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedIds={selectedArtworkIds}
        onSuccess={() => setSelectedArtworkIds([])}
      />

      <div className="flex justify-between items-center mb-6">
        {/* 검색 등 필터 컨테이너 */}
        <FilterContainer
          searchProps={{
            placeholder: "작품 제목 검색...",
            onSearch: handleSearch,
          }}
          filterProps={[
            {
              id: "platform",
              type: "dropdown-checkbox",
              label: "플랫폼",
              options: [
                { label: "Steam", value: GetArtworksPlatformsEnum.Steam },
                { label: "Switch", value: GetArtworksPlatformsEnum.Switch },
                { label: "GOG", value: GetArtworksPlatformsEnum.Gog },
                {
                  label: "Epic Games",
                  value: GetArtworksPlatformsEnum.EpicGames,
                },
                { label: "Android", value: GetArtworksPlatformsEnum.Android },
              ],
              value: platforms,
              onChange: handlePlatformChange,
            },
            {
              id: "genre",
              type: "combobox",
              label: "장르",
              options: genreOptions,
              selectedOptions: selectedGenreInfos,
              value: genres,
              onChange: handleGenreChange,
              searchValue: genreSearch,
              onSearch: setGenreSearch,
              isLoading: isGenreSearchLoading,
            },
            {
              id: "status",
              type: "dropdown-checkbox",
              label: "상태",
              options: [
                { label: "공개", value: GetArtworksStatusEnum.Published },
                { label: "비공개", value: GetArtworksStatusEnum.Draft },
              ],
              value: status,
              onChange: handleStatusChange,
            },
          ]}
          sortProps={{
            options: [
              { label: "최신순", value: GetArtworksSortEnum.CreatedDesc },
              { label: "과거순", value: GetArtworksSortEnum.CreatedAsc },
              { label: "평점 높은 순", value: GetArtworksSortEnum.RatingDesc },
              { label: "평점 낮은 순", value: GetArtworksSortEnum.RatingAsc },
            ],
            onSort: handleSort,
          }}
        />

        {/* 작품 생성 시 표시될 슬라이드오버 */}
        <SlideOver
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          trigger={<ActionButton action="add">작품 추가</ActionButton>}
          title="작품 추가"
          description="새로운 작품을 추가합니다."
        >
          <CreateArtworkForm onSuccess={() => setIsAddOpen(false)} />
        </SlideOver>
      </div>

      {/* 작품 목록 테이블 */}
      <DataTable
        columns={artworkColumns({
          onDeleteClick: handleSingleDelete,
        })}
        data={artworksResult?.data.items ?? []}
        isLoading={isArtworksLoading}
        pageCount={artworksResult?.data.metadata.totalPages}
        currentPage={artworksResult?.data.metadata.currentPage}
        onPageChange={setPage}
        skeletonColumns={artworkSkeletonColumns}
        enableRowSelection={true}
        selectedIds={selectedArtworkIds}
        onSelectedIdsChange={setSelectedArtworkIds}
      />
    </PageWrapper>
  );
}
