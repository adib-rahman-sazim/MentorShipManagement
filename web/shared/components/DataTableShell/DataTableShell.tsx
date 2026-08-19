import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/shadui/tabs";

import { DataTableContent, EDataTableVariant } from "./components/DataTableContent";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "./DataTableShell.constants";
import { noopPageSizeChange, noopSearchChange } from "./DataTableShell.helpers";
import type { IDataTableShellProps } from "./DataTableShell.interfaces";

export const DataTableShell = ({
  tabs,
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  children,
  paginationMetadata,
  onPageChange,
  isLoading,
  className,
  variant = EDataTableVariant.TABLE,
  showSearch = true,
  showPageSize = true,
  showPagination = true,
}: IDataTableShellProps) => {
  const contentProps = {
    searchValue,
    onSearchChange: onSearchChange ?? noopSearchChange,
    searchPlaceholder,
    filters,
    pageSize,
    onPageSizeChange: onPageSizeChange ?? noopPageSizeChange,
    pageSizeOptions,
    paginationMetadata,
    onPageChange,
    isLoading,
    variant,
    showSearch,
    showPageSize,
    showPagination,
  };

  if (tabs && tabs.length > 0 && activeTab && onTabChange) {
    return (
      <div className={cn("space-y-4", className)}>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="mb-4 bg-muted">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-muted-foreground data-[active]:bg-background data-[active]:text-foreground",
                  tab.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <DataTableContent {...contentProps}>{children}</DataTableContent>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableContent {...contentProps}>{children}</DataTableContent>
    </div>
  );
};
