"use client";

import { useEffect, useState } from "react";

import {
  GetArtworksPlatformsEnum,
  GetArtworksSortEnum,
  GetArtworksStatusEnum,
} from "@minhoyunlife/my-ts-client";

import { columns } from "@/src/app/(authenticated)/fanarts/columns";
import { DataTable } from "@/src/components/(authenticated)/data-table/table";
import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";
import { PageWrapper } from "@/src/components/(authenticated)/page-wrapper";
import { useArtworkQuery } from "@/src/hooks/artworks/use-artwork-query";
import { useToast } from "@/src/hooks/use-toast";

export default function FanartsListPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [platforms, setPlatforms] = useState<GetArtworksPlatformsEnum[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState<string>("");
  const [status, setStatus] = useState<GetArtworksStatusEnum[]>([]);
  const [sort, setSort] = useState<GetArtworksSortEnum>();

  const { data, isLoading, error } = useArtworkQuery({
    search,
    genres,
    platforms,
    sort,
    page,
    status,
  });

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
            options: [], // TODO: 장르 목록 API 구현 필요
            value: genres,
            onChange: handleGenreChange,
            searchValue: genreSearch,
            onSearch: setGenreSearch,
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
      <DataTable
        columns={columns}
        data={data?.data.items ?? []}
        isLoading={isLoading}
        pageCount={data?.data.metadata.totalPages}
        currentPage={data?.data.metadata.currentPage}
        onPageChange={setPage}
      />
    </PageWrapper>
  );
}
