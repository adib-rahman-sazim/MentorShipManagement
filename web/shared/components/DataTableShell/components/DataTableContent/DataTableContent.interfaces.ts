import type { ReactNode } from "react";

import type { EDataTableVariant } from "./DataTableContent.enums";

export interface IPageSizeOption {
  value: number | string;
  label: string;
}

export interface IPaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  itemsPerPage: number;
  totalItems: number;
}

export interface IDataTableContentProps {
  searchValue: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: IPageSizeOption[];
  paginationMetadata: IPaginationMetadata;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  variant?: EDataTableVariant;
  children: ReactNode;
  showSearch?: boolean;
  showPageSize?: boolean;
  showPagination?: boolean;
}
