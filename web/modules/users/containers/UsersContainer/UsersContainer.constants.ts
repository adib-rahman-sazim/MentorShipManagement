import type { IPageSizeOption } from "@/shared/components/DataTableShell/components/DataTableContent";

export const PAGINATION_LIMIT_OPTIONS = [5, 10, 20, 50, 100];

export const USERS_PAGE_SIZE_OPTIONS: IPageSizeOption[] = PAGINATION_LIMIT_OPTIONS.map((value) => ({
  value,
  label: String(value),
}));
