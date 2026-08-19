import type { ReactNode } from "react";

import type {
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  TableOptions,
  VisibilityState,
} from "@tanstack/react-table";

export interface ITableProps<TData> {
  data: TData[];
  columns: TableOptions<TData>["columns"];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  enableSorting?: boolean;
  manualSorting?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  isLoading?: boolean;
  skeletonRowCount?: number;
  emptyState?: ReactNode;
  className?: string;
  getRowId?: (originalRow: TData, index: number) => string;
}
