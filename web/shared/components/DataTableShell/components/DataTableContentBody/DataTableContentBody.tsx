import CustomPagination from "@/shared/components/CustomPagination";
import { EDataTableVariant } from "@/shared/components/DataTableShell/components/DataTableContent/DataTableContent.enums";
import TablePageSkeleton from "@/shared/components/skeletons/TablePageSkeleton";

import type { IDataTableContentBodyProps } from "./DataTableContentBody.interfaces";

export const DataTableContentBody = ({
  children,
  paginationMetadata,
  onPrevClick,
  onNextClick,
  onPageClick,
  isLoading,
  variant,
  showPagination = true,
}: IDataTableContentBodyProps) => {
  if (isLoading) {
    return <TablePageSkeleton showFilters={false} />;
  }

  if (variant === EDataTableVariant.CARDS) {
    return (
      <>
        {children}
        {showPagination ? (
          <div className="flex items-center justify-center py-4">
            <CustomPagination
              paginationMetadata={paginationMetadata}
              onPrevClick={onPrevClick}
              onNextClick={onNextClick}
              onPageClick={onPageClick}
            />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {children}
      {showPagination ? (
        <div className="flex items-center justify-center border-t border-border p-4">
          <CustomPagination
            paginationMetadata={paginationMetadata}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            onPageClick={onPageClick}
          />
        </div>
      ) : null}
    </div>
  );
};
