import { useQueryState } from "nuqs";

import { cn } from "@/lib/utils";

import CustomPagination from "../../CustomPagination";
import { ITablePaginationProps } from "./TablePagination.interfaces";

const TablePagination: React.FC<ITablePaginationProps> = ({ paginationMetadata, className }) => {
  const [_page, setPage] = useQueryState("page");
  const [_limit, setLimit] = useQueryState("limit");

  const handlePageClick = (page: number) => {
    setPage(String(page));
    setLimit(String(paginationMetadata.itemsPerPage));
  };

  const handleNextClick = () => {
    if (paginationMetadata.hasNextPage) {
      handlePageClick(paginationMetadata.currentPage + 1);
    }
  };

  const handlePrevClick = () => {
    if (paginationMetadata.hasPreviousPage) {
      handlePageClick(paginationMetadata.currentPage - 1);
    }
  };

  return (
    <>
      {paginationMetadata.totalPages > 1 ? (
        <CustomPagination
          paginationMetadata={paginationMetadata}
          onPageClick={handlePageClick}
          onNextClick={handleNextClick}
          onPrevClick={handlePrevClick}
          className={cn("mt-10 justify-start", className)}
        />
      ) : null}
    </>
  );
};

export default TablePagination;
