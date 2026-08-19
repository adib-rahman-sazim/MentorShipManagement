import type { ReactNode } from "react";

import type { EDataTableVariant } from "@/shared/components/DataTableShell/components/DataTableContent/DataTableContent.enums";
import type { IPaginationMetadata } from "@/shared/components/DataTableShell/components/DataTableContent/DataTableContent.interfaces";

export interface IDataTableContentBodyProps {
  children: ReactNode;
  paginationMetadata: IPaginationMetadata;
  onPrevClick: () => void;
  onNextClick: () => void;
  onPageClick: (page: number) => void;
  isLoading: boolean;
  variant: EDataTableVariant;
  showPagination?: boolean;
}
