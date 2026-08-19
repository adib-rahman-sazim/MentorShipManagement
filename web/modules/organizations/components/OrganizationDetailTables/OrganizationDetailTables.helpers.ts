import type { IPaginationMetadata } from "@/shared/components/DataTableShell/components/DataTableContent";

export const buildSinglePageMetadata = (itemCount: number): IPaginationMetadata => ({
  currentPage: 1,
  itemsPerPage: itemCount > 0 ? itemCount : 1,
  totalItems: itemCount,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});

export const noopPageChange = (): void => {
  return;
};
