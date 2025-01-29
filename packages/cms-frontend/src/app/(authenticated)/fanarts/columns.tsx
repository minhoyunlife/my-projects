"use client";

import Image from "next/image";

import type { ColumnDef } from "@tanstack/react-table";

import type { GetArtworks200ResponseItemsInner } from "@minhoyunlife/my-ts-client";
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { PlatformIcon } from "@/src/components/(authenticated)/platform-icon";
import { Badge } from "@/src/components/base/badge";
import { Button } from "@/src/components/base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/base/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/base/tooltip";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
};

interface GenreColumnProps {
  onDeleteClick: (id: string) => void;
}

export const artworkColumns = ({
  onDeleteClick,
}: GenreColumnProps): ColumnDef<GetArtworks200ResponseItemsInner>[] => [
  {
    id: "image",
    header: "이미지",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Image
          src={row.original.imageUrl}
          alt={
            row.original.translations.find((t) => t.language === "en")?.title ||
            ""
          }
          width={64}
          height={64}
          className="object-cover rounded"
        />
      </div>
    ),
  },
  {
    id: "title",
    header: "제목",
    cell: ({ row }) =>
      row.original.translations.find((t) => t.language === "ko")?.title || "",
  },
  {
    id: "genres",
    header: "장르",
    cell: ({ row }) => {
      const genres = row.original.genres;
      const maxDisplay = 2;
      const getGenreKoName = (genre: (typeof genres)[0]) => {
        return genre.translations.find((t) => t.language === "ko")?.name;
      };

      return (
        <div className="flex gap-1 flex-wrap">
          {genres.slice(0, maxDisplay).map((genre) => (
            <Badge
              key={genre.id}
              variant="outline"
            >
              {getGenreKoName(genre)}
            </Badge>
          ))}
          {genres.length > maxDisplay && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary">
                    +{genres.length - maxDisplay}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-black border">
                  <p>
                    {genres
                      .slice(maxDisplay)
                      .map((g) => getGenreKoName(g))
                      .join(", ")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "playedOn",
    header: "플랫폼",
    cell: ({ row }) => (
      <PlatformIcon
        platform={row.original.playedOn}
        className="h-5 w-5"
      />
    ),
  },
  {
    accessorKey: "rating",
    header: "평점",
    cell: ({ row }) => (
      <span className="block text-center">
        {row.original.rating >= 0 ? row.original.rating : "-"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "작성일",
    cell: ({ row }) => (
      <span className="block text-center">
        {row.original.createdAt ? formatDate(row.original.createdAt) : "-"}
      </span>
    ),
  },
  {
    id: "isDraft",
    header: "상태",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {row.original.isDraft ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </TooltipTrigger>
            <TooltipContent className="bg-white text-black border">
              {row.original.isDraft ? "비공개" : "공개"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
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
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                <span>수정</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {row.original.isDraft ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>공개</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    <span>비공개</span>
                  </>
                )}
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
