import { DataTableShell } from "@/shared/components/DataTableShell";
import { Table } from "@/shared/components/DataTableShell/Table";

import { buildSinglePageMetadata, noopPageChange } from "./OrganizationDetailTables.helpers";
import {
  TOrganizationInvitationsTableProps,
  TOrganizationMembersTableProps,
} from "./OrganizationDetailTables.types";

export const OrganizationMembersTable = ({
  data,
  columns,
  pageSize,
  pageSizeOptions,
  paginationMetadata,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: TOrganizationMembersTableProps) => (
  <DataTableShell
    showSearch={false}
    showPageSize
    showPagination
    searchValue=""
    pageSize={pageSize}
    pageSizeOptions={pageSizeOptions}
    paginationMetadata={paginationMetadata}
    onPageChange={onPageChange}
    onPageSizeChange={onPageSizeChange}
    isLoading={isLoading}
  >
    <Table
      data={data}
      columns={columns}
      getRowId={(row) => row.id}
      emptyState={
        <tr>
          <td colSpan={columns.length} className="py-16 text-center text-muted-foreground">
            No members found
          </td>
        </tr>
      }
    />
  </DataTableShell>
);

export const OrganizationInvitationsTable = ({
  data,
  columns,
}: TOrganizationInvitationsTableProps) => (
  <DataTableShell
    showSearch={false}
    showPageSize={false}
    showPagination={false}
    searchValue=""
    pageSize={data.length > 0 ? data.length : 1}
    paginationMetadata={buildSinglePageMetadata(data.length)}
    onPageChange={noopPageChange}
    isLoading={false}
  >
    <Table
      data={data}
      columns={columns}
      getRowId={(row) => row.id}
      emptyState={
        <tr>
          <td colSpan={columns.length} className="py-16 text-center text-muted-foreground">
            No invitations found
          </td>
        </tr>
      }
    />
  </DataTableShell>
);
