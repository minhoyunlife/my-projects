"use client";

import { useEffect, useState } from "react";

import { Trash2 } from "lucide-react";

import { CreateGenreForm } from "@/src/app/(authenticated)/genres/(actions)/create";
import { DeleteGenresDialog } from "@/src/app/(authenticated)/genres/(actions)/delete";
import type { Genre } from "@/src/app/(authenticated)/genres/(actions)/update";
import { UpdateGenreForm } from "@/src/app/(authenticated)/genres/(actions)/update";
import { genreColumns } from "@/src/app/(authenticated)/genres/columns";
import { ActionButton } from "@/src/components/(authenticated)/action-button";
import { genreSkeletonColumns } from "@/src/components/(authenticated)/data-table/skeleton";
import { DataTable } from "@/src/components/(authenticated)/data-table/table";
import { FilterContainer } from "@/src/components/(authenticated)/filter/filter-container";
import { PageWrapper } from "@/src/components/(authenticated)/page-wrapper";
import { SelectionActionBar } from "@/src/components/(authenticated)/selected-action-bar";
import { SlideOver } from "@/src/components/(authenticated)/slide-over";
import { useGenres } from "@/src/hooks/genres/use-genres";
import { useToast } from "@/src/hooks/use-toast";

export default function GenresListPage() {
  const { toast } = useToast();
  const { useList } = useGenres();

  // 페이징 및 검색 관련
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");

  // 장르 추가 슬라이드오버 관련
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 장르 수정 슬라이드오버 관련
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 행 선택 및 삭제 관련
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: genresResult,
    isLoading: isGenresLoading,
    error,
  } = useList({
    search,
    page,
  });

  const handlePageChange = (newPage: number) => {
    setSelectedGenreIds([]);
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setSelectedGenreIds([]);
    setPage(1);
    setSearch(value);
  };

  const handleSingleEdit = (genre: Genre) => {
    setSelectedGenre(genre);
    setIsEditOpen(true);
  };

  const handleSingleDelete = (id: string) => {
    setSelectedGenreIds([id]);
    setIsDeleteDialogOpen(true);
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
      {/* 행 선택 후 상단에 표시할 액션 바 */}
      {selectedGenreIds.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedGenreIds.length}
          itemLabel="장르"
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

      {/* 장르 삭제 확인 다이얼로그 */}
      <DeleteGenresDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedIds={selectedGenreIds}
        onSuccess={() => setSelectedGenreIds([])}
      />

      <div className="flex justify-between items-center mb-6">
        {/* 검색 등 필터 컨테이너 */}
        <FilterContainer
          searchProps={{
            placeholder: "장르명 검색...",
            onSearch: handleSearch,
          }}
        />

        {/* 장르 생성 시 표시될 슬라이드오버 */}
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

      {/* 장르 수정을 위한 슬라이드오버 */}
      <SlideOver
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="장르 수정"
        description="장르의 정보를 수정합니다."
      >
        {selectedGenre && (
          <UpdateGenreForm
            genre={selectedGenre}
            onSuccess={() => {
              setIsEditOpen(false);
              setSelectedGenre(null);
            }}
          />
        )}
      </SlideOver>

      {/* 장르 목록 테이블 */}
      <DataTable
        columns={genreColumns({
          onDeleteClick: handleSingleDelete,
          onEditClick: handleSingleEdit,
        })}
        data={genresResult?.data.items ?? []}
        isLoading={isGenresLoading}
        pageCount={genresResult?.data.metadata.totalPages}
        currentPage={genresResult?.data.metadata.currentPage}
        onPageChange={handlePageChange}
        skeletonColumns={genreSkeletonColumns}
        enableRowSelection={true}
        selectedIds={selectedGenreIds}
        onSelectedIdsChange={setSelectedGenreIds}
      />
    </PageWrapper>
  );
}
