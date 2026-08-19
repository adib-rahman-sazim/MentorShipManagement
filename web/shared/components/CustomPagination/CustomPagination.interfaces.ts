import { TPaginationMetadata } from "@/shared/typedefs";

export interface IPaginationProps {
  paginationMetadata: TPaginationMetadata;
  totalPagesToDisplay?: number;
  onPrevClick: () => void;
  onNextClick: () => void;
  onPageClick: (page: number) => void;
  className?: string;
}
