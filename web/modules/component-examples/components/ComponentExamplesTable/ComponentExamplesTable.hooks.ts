import { useMemo, useState } from "react";

import {
  COMPONENT_EXAMPLES_MOCK_ROWS,
  COMPONENT_EXAMPLES_TABLE_PAGE_SIZE,
} from "./ComponentExamplesTable.constants";
import {
  buildComponentExamplesPaginationMetadata,
  filterComponentExamplesRows,
  paginateComponentExamplesRows,
} from "./ComponentExamplesTable.helpers";

export const useComponentExamplesTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(COMPONENT_EXAMPLES_TABLE_PAGE_SIZE);

  const filteredRows = useMemo(
    () => filterComponentExamplesRows(COMPONENT_EXAMPLES_MOCK_ROWS, searchValue, statusFilter),
    [searchValue, statusFilter],
  );

  const paginatedRows = useMemo(
    () => paginateComponentExamplesRows(filteredRows, page, pageSize),
    [filteredRows, page, pageSize],
  );

  const paginationMetadata = useMemo(
    () =>
      buildComponentExamplesPaginationMetadata({
        page,
        pageSize,
        totalItems: filteredRows.length,
      }),
    [filteredRows.length, page, pageSize],
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string | null) => {
    if (value === null) {
      return;
    }
    setStatusFilter(value);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    searchValue,
    statusFilter,
    pageSize,
    paginatedRows,
    paginationMetadata,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageSizeChange,
    handlePageChange: setPage,
  };
};
