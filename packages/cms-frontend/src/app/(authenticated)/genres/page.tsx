"use client";

import { useEffect, useState } from "react";

import { columns } from "@/src/app/(authenticated)/genres/columns";
import { genreSkeletonColumns } from "@/src/components/(authenticated)/data-table/skeleton";
import { DataTable } from "@/src/components/(authenticated)/data-table/table";
import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";
import { PageWrapper } from "@/src/components/(authenticated)/page-wrapper";
import { useGenreListQuery } from "@/src/hooks/genres/use-genre-list-query";
import { useToast } from "@/src/hooks/use-toast";

export default function GenresListPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  const {
    data: genresResult,
    isLoading: isGenresLoading,
    error,
  } = useGenreListQuery({
    search,
    page,
  });

  const handleSearch = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "에러 발생",
        description: "장르 목록을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <PageWrapper title="팬아트 장르 목록">
      <FilterContainer
        searchProps={{
          placeholder: "장르명 검색...",
          onSearch: handleSearch,
        }}
      />
      <DataTable
        columns={columns}
        data={genresResult?.data.items ?? []}
        isLoading={isGenresLoading}
        pageCount={genresResult?.data.metadata.totalPages}
        currentPage={genresResult?.data.metadata.currentPage}
        onPageChange={setPage}
        skeletonColumns={genreSkeletonColumns}
      />
    </PageWrapper>
  );
}
