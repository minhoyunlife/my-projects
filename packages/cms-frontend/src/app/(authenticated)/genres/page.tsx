"use client";

import { useEffect, useState } from "react";

import { CreateGenreForm } from "@/src/app/(authenticated)/genres/(actions)/create";
import { genreColumns } from "@/src/app/(authenticated)/genres/columns";
import { ActionButton } from "@/src/components/(authenticated)/action-button";
import { genreSkeletonColumns } from "@/src/components/(authenticated)/data-table/skeleton";
import { DataTable } from "@/src/components/(authenticated)/data-table/table";
import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";
import { PageWrapper } from "@/src/components/(authenticated)/page-wrapper";
import { SlideOver } from "@/src/components/(authenticated)/slide-over";
import { useGenreListQuery } from "@/src/hooks/genres/use-genre-list-query";
import { useToast } from "@/src/hooks/use-toast";

export default function GenresListPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  const [isAddOpen, setIsAddOpen] = useState(false);

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
      <div className="flex justify-between items-center mb-6">
        <FilterContainer
          searchProps={{
            placeholder: "장르명 검색...",
            onSearch: handleSearch,
          }}
        />
        <SlideOver
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          trigger={<ActionButton action="add">장르 추가</ActionButton>}
          title="장르 추가"
          description="새로운 장르를 추가합니다."
        >
          <CreateGenreForm onSuccess={() => setIsAddOpen(false)} />
        </SlideOver>
      </div>
      <DataTable
        columns={genreColumns}
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
