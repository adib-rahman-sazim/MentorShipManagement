import { Skeleton } from "@/shared/components/shadui/skeleton";

import { CELL_WIDTHS, HEADER_WIDTHS } from "./TablePageSkeleton.constants";
import { ITablePageSkeletonProps } from "./TablePageSkeleton.interfaces";

const TablePageSkeleton = ({
  columns = 5,
  rows = 5,
  showFilters = true,
}: ITablePageSkeletonProps) => {
  const headerIndexes = Array.from({ length: columns }, (_, index) => index);
  const rowKeys = Array.from({ length: rows }, (_, index) => `row-${index + 1}`);

  return (
    <div className="space-y-6">
      {showFilters ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {headerIndexes.map((headerIndex) => (
                <th key={`header-${headerIndex + 1}`} className="px-6 py-4">
                  <Skeleton
                    className={`h-3 ${HEADER_WIDTHS[headerIndex % HEADER_WIDTHS.length]}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rowKeys.map((rowKey) => (
              <tr key={rowKey}>
                {headerIndexes.map((columnIndex) => (
                  <td key={`${rowKey}-column-${columnIndex + 1}`} className="px-6 py-4">
                    <Skeleton className={`h-4 ${CELL_WIDTHS[columnIndex % CELL_WIDTHS.length]}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border p-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePageSkeleton;
