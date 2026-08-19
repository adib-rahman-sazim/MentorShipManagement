import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { DefaultEmptyState, SortIcon } from "./components";
import { getAlignmentClass, getColumnAlign } from "./Table.helpers";
import type { ITableProps } from "./Table.interfaces";
import { TableSkeleton } from "./TableSkeleton";

export const Table = <TData,>({
  data,
  columns,
  sorting,
  onSortingChange,
  enableSorting,
  manualSorting,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection,
  columnVisibility,
  onColumnVisibilityChange,
  isLoading,
  skeletonRowCount = 5,
  emptyState,
  className,
  getRowId,
}: ITableProps<TData>) => {
  const state = {
    ...(sorting !== undefined ? { sorting } : {}),
    ...(rowSelection !== undefined ? { rowSelection } : {}),
    ...(columnVisibility !== undefined ? { columnVisibility } : {}),
  };

  const table = useReactTable({
    data,
    columns,
    state,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting,
    enableSorting,
    enableRowSelection,
    ...(getRowId !== undefined && { getRowId }),
    ...(onSortingChange !== undefined && { onSortingChange }),
    ...(onRowSelectionChange !== undefined && { onRowSelectionChange }),
    ...(onColumnVisibilityChange !== undefined && { onColumnVisibilityChange }),
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const columnCount = columns.length;

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full table-fixed text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-slate-200 cursor-pointer">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const align = getColumnAlign(header.column.columnDef);
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      "px-4 py-3",
                      getAlignmentClass(align),
                      canSort && "cursor-pointer select-none hover:text-slate-800",
                    )}
                    style={{ width: header.column.columnDef.size }}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && <SortIcon direction={header.column.getIsSorted()} />}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        {isLoading ? (
          <TableSkeleton rows={skeletonRowCount} columns={columnCount} />
        ) : (
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0
              ? emptyState || <DefaultEmptyState colSpan={columnCount} />
              : rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors hover:bg-slate-50 cursor-pointer",
                      row.getIsSelected() && "bg-blue-50 hover:bg-blue-50",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = getColumnAlign(cell.column.columnDef);
                      return (
                        <td key={cell.id} className={cn("px-4 py-3", getAlignmentClass(align))}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        )}
      </table>
    </div>
  );
};
