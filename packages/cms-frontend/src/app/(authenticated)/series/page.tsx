"use client";

import { useEffect, useState } from "react";

import { seriesColumns } from "@/src/app/(authenticated)/series/columns";
import { seriesSkeletonColumns } from "@/src/components/(authenticated)/data-table/skeleton";
import { DataTable } from "@/src/components/(authenticated)/data-table/table";
import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";
import { PageWrapper } from "@/src/components/(authenticated)/page-wrapper";
import { useSeries } from "@/src/hooks/series/use-series";
import { useToast } from "@/src/hooks/use-toast";

export default function SeriesListPage() {
  const { toast } = useToast();
  const { useList } = useSeries();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  const {
    data: seriesResult,
    isLoading: isSeriesLoading,
    error,
  } = useList({
    search,
    page,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "에러 발생",
        description: "시리즈 목록을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <PageWrapper title="시리즈 목록">
      <div className="flex justify-between items-center mb-6">
        {/* 검색 등 필터 컨테이너 */}
        <FilterContainer
          searchProps={{
            placeholder: "시리즈명 검색...",
            onSearch: handleSearch,
          }}
        />
      </div>

      {/* 시리즈 목록 테이블 */}
      <DataTable
        columns={seriesColumns()}
        data={seriesResult?.data.items ?? []}
        isLoading={isSeriesLoading}
        pageCount={seriesResult?.data.metadata.totalPages}
        currentPage={seriesResult?.data.metadata.currentPage}
        onPageChange={handlePageChange}
        skeletonColumns={seriesSkeletonColumns}
        enableRowSelection={false}
      />
    </PageWrapper>
  );
}
