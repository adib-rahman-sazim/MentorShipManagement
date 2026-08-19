import type { ColumnDef } from "@tanstack/react-table";

import type { IPaginationMetadata } from "@/shared/components/DataTableShell/components/DataTableContent";

import type { IComponentExampleRow } from "./ComponentExamplesTable.interfaces";

export const getComponentExamplesTableColumns = (): ColumnDef<IComponentExampleRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original.status,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
];

export const buildComponentExamplesPaginationMetadata = ({
  page,
  pageSize,
  totalItems,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
}): IPaginationMetadata => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return {
    currentPage: page,
    totalPages,
    itemsPerPage: pageSize,
    totalItems,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const filterComponentExamplesRows = (
  rows: IComponentExampleRow[],
  searchValue: string,
  statusFilter: string,
): IComponentExampleRow[] => {
  const normalizedSearch = searchValue.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    if (!matchesStatus) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = `${row.name} ${row.email} ${row.role} ${row.status}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });
};

export const paginateComponentExamplesRows = (
  rows: IComponentExampleRow[],
  page: number,
  pageSize: number,
): IComponentExampleRow[] => {
  const startIndex = (page - 1) * pageSize;
  return rows.slice(startIndex, startIndex + pageSize);
};
