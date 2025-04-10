"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { GetSeries200ResponseItemsInner } from "@minhoyunlife/my-ts-client";
import { MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react";

import type { Series } from "@/src/app/(authenticated)/series/(actions)/update";
import { Button } from "@/src/components/base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/base/dropdown-menu";

interface SeriesColumnProps {
  onEditClick: (series: Series) => void;
  onDeleteClick: (id: string) => void;
  onManageArtworksClick: (series: Series) => void;
}

export const seriesColumns = ({
  onEditClick,
  onDeleteClick,
  onManageArtworksClick,
}: SeriesColumnProps): ColumnDef<GetSeries200ResponseItemsInner>[] => [
  {
    id: "koTitle",
    header: "한국어",
    cell: ({ row }) =>
      row.original.translations.find((t) => t.language === "ko")?.title ?? "-",
  },
  {
    accessorKey: "enTitle",
    header: "English",
    cell: ({ row }) =>
      row.original.translations.find((t) => t.language === "en")?.title ?? "-",
  },
  {
    accessorKey: "jaTitle",
    header: "日本語",
    cell: ({ row }) =>
      row.original.translations.find((t) => t.language === "ja")?.title ?? "-",
  },
  {
    id: "artworkCount",
    header: "작품 수",
    cell: ({ row }) => row.original.seriesArtworks.length,
  },
  {
    id: "actions",
    header: "작업",
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="more"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditClick(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>수정</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onManageArtworksClick(row.original)}
              >
                <Layers className="mr-2 h-4 w-4" />
                <span>작품 연결 관리</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteClick(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>삭제</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
