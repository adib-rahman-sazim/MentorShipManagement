import { useMemo } from "react";

import { cn } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../shadui/pagination";
import { calculateStartPage, createDisplayedPages } from "./CustomPagination.helpers";
import { IPaginationProps } from "./CustomPagination.interfaces";

const CustomPagination: React.FC<IPaginationProps> = ({
  paginationMetadata,
  totalPagesToDisplay = 3,
  onPrevClick,
  onNextClick,
  onPageClick,
  className,
}) => {
  const { currentPage, totalPages, hasPreviousPage, hasNextPage } = paginationMetadata;
  const half = Math.floor(totalPagesToDisplay / 2);

  const showLeftEllipsis = currentPage > half + 1;
  const showRightEllipsis =
    totalPagesToDisplay % 2 === 0
      ? totalPages - currentPage > half - 1
      : totalPages - currentPage > half;

  const displayedPages = useMemo(() => {
    if (totalPages <= totalPagesToDisplay) {
      return createDisplayedPages(1, totalPages);
    } else {
      const startPage = calculateStartPage(currentPage, half, totalPages, totalPagesToDisplay);
      return createDisplayedPages(startPage, totalPagesToDisplay);
    }
  }, [currentPage, half, totalPages, totalPagesToDisplay]);

  return (
    <Pagination className={cn(className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="hover:bg-transparent border border-transparent hover:border-input cursor-pointer select-none"
            onClick={onPrevClick}
            aria-disabled={!hasPreviousPage}
          />
        </PaginationItem>
        {showLeftEllipsis ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        {displayedPages
          ? displayedPages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  className="cursor-pointer hover:bg-transparent hover:border hover:border-border select-none"
                  isActive={page === currentPage}
                  onClick={() => onPageClick(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))
          : null}
        {showRightEllipsis ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        <PaginationItem>
          <PaginationNext
            className="hover:bg-transparent border border-transparent hover:border-input cursor-pointer select-none"
            onClick={onNextClick}
            aria-disabled={!hasNextPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;
