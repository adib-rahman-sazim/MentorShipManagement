import { DataTableContentBody } from "@/shared/components/DataTableShell/components/DataTableContentBody";
import {
  noopPageSizeChange,
  noopSearchChange,
} from "@/shared/components/DataTableShell/DataTableShell.helpers";
import { SearchInput } from "@/shared/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadui/select";
import { formatNumber } from "@/shared/utils/number.utils";

import { DEFAULT_SEARCH_PLACEHOLDER, SHOW_LABEL } from "./DataTableContent.constants";
import { EDataTableVariant } from "./DataTableContent.enums";
import type { IDataTableContentProps } from "./DataTableContent.interfaces";

export const DataTableContent = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  filters,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  children,
  paginationMetadata,
  onPageChange,
  isLoading,
  variant = EDataTableVariant.TABLE,
  showSearch = true,
  showPageSize = true,
  showPagination = true,
}: IDataTableContentProps) => {
  const resolvedOnSearchChange = onSearchChange ?? noopSearchChange;
  const resolvedOnPageSizeChange = onPageSizeChange ?? noopPageSizeChange;

  const handlePageSizeChange = (value: string | null) => {
    if (value === null) {
      return;
    }
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      resolvedOnPageSizeChange(parsed);
    }
  };

  const handlePrevClick = () => {
    if (paginationMetadata.hasPreviousPage) {
      onPageChange(paginationMetadata.currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (paginationMetadata.hasNextPage) {
      onPageChange(paginationMetadata.currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const showToolbar = showSearch || Boolean(filters) || showPageSize;

  return (
    <div className="space-y-4">
      {showToolbar ? (
        <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
            {showSearch ? (
              <SearchInput
                value={searchValue}
                onChange={resolvedOnSearchChange}
                placeholder={searchPlaceholder}
              />
            ) : null}
            {filters}
          </div>
          {showPageSize ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                {SHOW_LABEL}
              </span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger size="sm" className="w-16">
                  <SelectValue renderValue={(value) => formatNumber(Number(value))} />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions?.map((option) => (
                    <SelectItem key={String(option.value)} value={String(option.value)}>
                      {formatNumber(Number(option.label))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      ) : null}
      <DataTableContentBody
        paginationMetadata={paginationMetadata}
        onPrevClick={handlePrevClick}
        onNextClick={handleNextClick}
        onPageClick={handlePageClick}
        isLoading={isLoading}
        variant={variant}
        showPagination={showPagination}
      >
        {children}
      </DataTableContentBody>
    </div>
  );
};
