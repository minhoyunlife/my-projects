"use client";

import type { ColumnDef } from "@tanstack/react-table";

export interface Series {
  id: string;
  translations: Array<{
    language: string;
    title: string;
  }>;
  seriesArtworks: Array<{
    id: string;
    order: number;
    translations: Array<{
      language: string;
      title: string;
    }>;
  }>;
}

export const seriesColumns = (): ColumnDef<Series>[] => [
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
];
