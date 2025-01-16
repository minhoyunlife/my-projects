"use client";

import { useEffect, useMemo } from "react";

import type { ColumnDef, Table as TableType } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { DataTablePagination } from "@/src/components/(authenticated)/data-table/pagination";
import type { ColumnSkeleton } from "@/src/components/(authenticated)/data-table/skeleton";
import { DataTableSkeleton } from "@/src/components/(authenticated)/data-table/skeleton";
import { Checkbox } from "@/src/components/base/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/base/table";

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  isLoading?: boolean;
  skeletonColumns: ColumnSkeleton[];
  data: TData[];
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  enableRowSelection?: boolean;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  isLoading,
  skeletonColumns,
  data,
  pageCount = 1,
  currentPage = 1,
  onPageChange,
  enableRowSelection,
  selectedIds = [],
  onSelectedIdsChange,
}: DataTableProps<TData, TValue>) {
  const pagination = useMemo(
    () => ({
      pageIndex: currentPage - 1,
      pageSize: 10,
    }),
    [currentPage],
  );

  const rowSelection = useMemo(() => {
    return Object.fromEntries(
      data.map((row, index) => [
        index.toString(),
        selectedIds.includes(row.id),
      ]),
    );
  }, [data, selectedIds]);

  const table: TableType<TData> = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
      rowSelection,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater(pagination);
        onPageChange?.(newState.pageIndex + 1);
      }
    },
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater(rowSelection);
        const newSelectedIds = data
          .filter((_, index) => newState[index.toString()])
          .map((item) => item.id);

        onSelectedIdsChange?.(newSelectedIds);
      }
    },
  });

  useEffect(() => {
    const rowSelection = Object.fromEntries(
      table
        .getRowModel()
        .rows.map((row) => [row.id, selectedIds.includes(row.original.id)]),
    );
    table.setRowSelection(rowSelection);
  }, [selectedIds, table]);

  if (isLoading) {
    return <DataTableSkeleton columns={skeletonColumns} />;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {/* 체크박스 컬럼 */}
                {enableRowSelection && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        table.getIsAllRowsSelected() ||
                        (table.getIsSomeRowsSelected() && "indeterminate")
                      }
                      onCheckedChange={(value) => {
                        table.toggleAllRowsSelected(!!value);
                      }}
                      aria-label="select-all"
                    />
                  </TableHead>
                )}

                {/* 헤더 컬럼 */}
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {/* 체크박스 셀 */}
                  {enableRowSelection && (
                    <TableCell className="w-[50px]">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="row-select"
                      />
                    </TableCell>
                  )}

                  {/* 데이터 셀 */}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        totalPages={pageCount}
      />
    </>
  );
}
