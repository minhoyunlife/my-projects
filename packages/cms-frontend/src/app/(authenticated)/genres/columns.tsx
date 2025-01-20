"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { GetArtworks200ResponseItemsInnerGenresInner } from "@minhoyunlife/my-ts-client";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Genre } from "@/src/app/(authenticated)/genres/(actions)/update";
import { Button } from "@/src/components/base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/base/dropdown-menu";

interface GenreColumnProps {
  onEditClick: (genre: Genre) => void;
  onDeleteClick: (id: string) => void;
}

// TODO: ColumnDef type 을 현재로서는 생성된 클라이언트에 의존하고 있으나, 마음에 안 듦.
export const genreColumns = ({
  onEditClick,
  onDeleteClick,
}: GenreColumnProps): ColumnDef<GetArtworks200ResponseItemsInnerGenresInner>[] => [
  {
    id: "koName",
    header: "한국어",
    cell: ({ row }) =>
      row.original.translations.find((t) => t.language === "ko")?.name ?? "-",
  },
  {
    accessorKey: "enName",
    header: "English",
    cell: ({ row }) =>
      row.original.translations.find((t) => t.language === "en")?.name ?? "-",
  },
  {
    accessorKey: "jaName",
    header: "日本語",
    cell: ({ row }) =>
      row.original.translations.find((t) => t.language === "ja")?.name ?? "-",
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
