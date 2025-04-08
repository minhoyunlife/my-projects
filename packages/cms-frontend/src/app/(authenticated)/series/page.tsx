"use client";

import { useEffect, useState } from "react";

import { Trash2 } from "lucide-react";

import { CreateSeriesForm } from "@/src/app/(authenticated)/series/(actions)/create";
import { DeleteSeriesDialog } from "@/src/app/(authenticated)/series/(actions)/delete";
import { seriesColumns } from "@/src/app/(authenticated)/series/columns";
import { ActionButton } from "@/src/components/(authenticated)/action-button";
import { seriesSkeletonColumns } from "@/src/components/(authenticated)/data-table/skeleton";
import { DataTable } from "@/src/components/(authenticated)/data-table/table";
import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";
import { PageWrapper } from "@/src/components/(authenticated)/page-wrapper";
import { SelectionActionBar } from "@/src/components/(authenticated)/selection-action-bar";
import { SlideOver } from "@/src/components/(authenticated)/slide-over";
import { useSeries } from "@/src/hooks/series/use-series";
import { useToast } from "@/src/hooks/use-toast";

export default function SeriesListPage() {
  const { toast } = useToast();
  const { useList } = useSeries();

  // 페이징 및 검색 관련
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  // 시리즈 추가 슬라이드오버 관련
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 행 선택 및 삭제 관련
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleSingleDelete = (id: string) => {
    setSelectedSeriesIds([id]);
    setIsDeleteDialogOpen(true);
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
      {/* 행 선택 후 상단에 표시할 액션 바 */}
      {selectedSeriesIds.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedSeriesIds.length}
          itemLabel="시리즈"
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

      {/* 시리즈 삭제 확인 다이얼로그 */}
      <DeleteSeriesDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedIds={selectedSeriesIds}
        onSuccess={() => setSelectedSeriesIds([])}
      />

      <div className="flex justify-between items-center mb-6">
        {/* 검색 등 필터 컨테이너 */}
        <FilterContainer
          searchProps={{
            placeholder: "시리즈명 검색...",
            onSearch: handleSearch,
          }}
        />

        {/* 시리즈 생성 시 표시될 슬라이드오버 */}
        <SlideOver
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          trigger={<ActionButton action="add">시리즈 추가</ActionButton>}
          title="시리즈 추가"
          description="새로운 시리즈를 추가합니다."
        >
          <CreateSeriesForm onSuccess={() => setIsAddOpen(false)} />
        </SlideOver>
      </div>

      {/* 시리즈 목록 테이블 */}
      <DataTable
        columns={seriesColumns({
          onDeleteClick: handleSingleDelete,
        })}
        data={seriesResult?.data.items ?? []}
        isLoading={isSeriesLoading}
        pageCount={seriesResult?.data.metadata.totalPages}
        currentPage={seriesResult?.data.metadata.currentPage}
        onPageChange={handlePageChange}
        skeletonColumns={seriesSkeletonColumns}
        enableRowSelection={true}
        selectedIds={selectedSeriesIds}
        onSelectedIdsChange={setSelectedSeriesIds}
      />
    </PageWrapper>
  );
}
