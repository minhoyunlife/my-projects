"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { GetArtworks200ResponseItemsInnerAllOfGenresInner } from "@minhoyunlife/my-ts-client";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/src/components/base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/base/dropdown-menu";

export const columns: ColumnDef<GetArtworks200ResponseItemsInnerAllOfGenresInner>[] =
  [
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
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>수정</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
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
