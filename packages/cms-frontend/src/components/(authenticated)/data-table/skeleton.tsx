import { Skeleton } from "@/src/components/base/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/base/table";

export interface ColumnSkeleton {
  width?: string;
  align?: "left" | "center" | "right";
  content?: "text" | "badge" | "image" | "action" | "badges";
}

interface DataTableSkeletonProps {
  columns: ColumnSkeleton[];
  rowCount?: number;
}

function getAlignClass(align?: string) {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

function getHeaderSkeletonClass(col: ColumnSkeleton) {
  const baseClass = col.align === "center" ? "mx-auto" : "";

  switch (col.content) {
    case "image":
      return `h-4 w-16 ${baseClass}`;
    case "badges":
    case "badge":
      return `h-4 ${col.width || "w-16"} ${baseClass}`;
    case "action":
      return `h-4 w-8 ${baseClass}`;
    default:
      return `h-4 ${col.width || "max-w-[200px]"} ${baseClass}`;
  }
}

function getSkeletonContent(col: ColumnSkeleton) {
  const baseClass = col.align === "center" ? "mx-auto" : "";

  switch (col.content) {
    case "image":
      return <Skeleton className={`h-16 w-16 rounded ${baseClass}`} />;
    case "badge":
      return <Skeleton className={`h-5 w-16 ${baseClass}`} />;
    case "badges":
      return (
        <div className="flex gap-1 flex-wrap">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      );
    case "action":
      return <Skeleton className={`h-8 w-8 ${baseClass}`} />;
    default:
      return (
        <Skeleton
          className={`h-4 w-full ${col.width || "max-w-[200px]"} ${baseClass}`}
        />
      );
  }
}

export function DataTableSkeleton({
  columns,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <div
      className="rounded-md border"
      data-testid="data-table-skeleton"
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={getAlignClass(col.align)}
              >
                <Skeleton className={getHeaderSkeletonClass(col)} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  className={getAlignClass(col.align)}
                >
                  {getSkeletonContent(col)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const artworkSkeletonColumns: ColumnSkeleton[] = [
  { content: "image", align: "center" },
  { content: "text", width: "w-[300px]" },
  { content: "badges", width: "w-[200px]" },
  { content: "action", align: "center", width: "w-10" },
  { content: "text", align: "center", width: "w-12" },
  { content: "text", align: "center", width: "w-20" },
  { content: "action", align: "center", width: "w-10" },
  { content: "action", align: "center", width: "w-10" },
];

export const genreSkeletonColumns: ColumnSkeleton[] = [
  { content: "text", align: "center", width: "w-1/3" },
  { content: "text", align: "center", width: "w-1/3" },
  { content: "text", align: "center", width: "w-1/3" },
  { content: "action", align: "center", width: "w-10" },
];

export const seriesSkeletonColumns: ColumnSkeleton[] = [
  { content: "text", align: "center", width: "w-1/4" },
  { content: "text", align: "center", width: "w-1/4" },
  { content: "text", align: "center", width: "w-1/4" },
  { content: "text", align: "center", width: "w-1/4" },
];
