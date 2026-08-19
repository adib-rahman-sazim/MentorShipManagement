import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadui/skeleton";

import { DEFAULT_COLUMNS, DEFAULT_ROWS, SHIMMER_ANIMATION } from "./TableSkeleton.constants";
import { ITableSkeletonProps } from "./TableSkeleton.interfaces";

const TableSkeleton = ({ rows = DEFAULT_ROWS, columns = DEFAULT_COLUMNS }: ITableSkeletonProps) => {
  const headerCells = Array.from({ length: columns }, (_, columnIndex) => ({
    key: `table-header-skeleton-${columnIndex + 1}`,
    columnIndex,
  }));
  const bodyRows = Array.from({ length: rows }, (_, rowIndex) => ({
    key: `table-row-skeleton-${rowIndex + 1}`,
    cells: Array.from({ length: columns - 1 }, (_, columnIndex) => ({
      key: `table-cell-skeleton-${rowIndex + 1}-${columnIndex + 1}`,
      columnIndex,
    })),
  }));

  return (
    <div className="w-full space-y-4">
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div
          className={cn(
            "flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3.5",
            SHIMMER_ANIMATION,
          )}
        >
          <div className="flex items-center gap-3">
            {headerCells.map(({ key, columnIndex }) => (
              <div
                key={key}
                className="flex items-center gap-1.5"
                style={{ minWidth: columnIndex === 0 ? "10rem" : "6rem" }}
              >
                <Skeleton className="h-3.5 w-20" />
                {columnIndex < 3 ? <Skeleton className="h-3 w-3" /> : null}
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="divide-y divide-border/40">
          {bodyRows.map((row) => (
            <div
              key={row.key}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/20",
                SHIMMER_ANIMATION,
              )}
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              {row.cells.map(({ key, columnIndex }) => (
                <div
                  key={key}
                  className="flex-1"
                  style={{ minWidth: columnIndex === 0 ? "8rem" : "5rem" }}
                >
                  {columnIndex === 2 ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ) : null}
                  {columnIndex === 3 ? <Skeleton className="h-6 w-20 rounded-md" /> : null}
                  {columnIndex !== 2 && columnIndex !== 3 && columnIndex >= columns - 2 ? (
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  ) : null}
                  {columnIndex !== 2 && columnIndex !== 3 && columnIndex < columns - 2 ? (
                    <Skeleton className="h-4 w-32" />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={cn("flex items-center justify-between px-1 py-2", SHIMMER_ANIMATION)}>
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
