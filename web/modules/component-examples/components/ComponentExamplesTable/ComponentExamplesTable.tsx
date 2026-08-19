import { DataTableShell } from "@/shared/components/DataTableShell";
import { Table } from "@/shared/components/DataTableShell/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadui/select";

import { COMPONENT_EXAMPLES_STATUS_FILTER_OPTIONS } from "./ComponentExamplesTable.constants";
import { getComponentExamplesTableColumns } from "./ComponentExamplesTable.helpers";
import { useComponentExamplesTable } from "./ComponentExamplesTable.hooks";

const ComponentExamplesTable = () => {
  const {
    searchValue,
    statusFilter,
    pageSize,
    paginatedRows,
    paginationMetadata,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageSizeChange,
    handlePageChange,
  } = useComponentExamplesTable();

  const columns = getComponentExamplesTableColumns();

  return (
    <DataTableShell
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search people..."
      filters={
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[11rem]">
            <SelectValue
              placeholder="Filter by status"
              renderValue={(value) =>
                COMPONENT_EXAMPLES_STATUS_FILTER_OPTIONS.find((option) => option.value === value)
                  ?.label ?? String(value)
              }
            />
          </SelectTrigger>
          <SelectContent>
            {COMPONENT_EXAMPLES_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      paginationMetadata={paginationMetadata}
      onPageChange={handlePageChange}
      isLoading={false}
    >
      <Table data={paginatedRows} columns={columns} />
    </DataTableShell>
  );
};

export default ComponentExamplesTable;
