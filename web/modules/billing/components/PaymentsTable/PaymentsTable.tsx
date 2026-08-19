import { usePaymentsTable } from "@/modules/billing/components/PaymentsTable/PaymentsTable.hooks";
import { DataTableShell } from "@/shared/components/DataTableShell";
import { Table } from "@/shared/components/DataTableShell/Table";

export const PaymentsTable = () => {
  const {
    columns,
    rows,
    isDataLoading,
    isEmpty,
    isError,
    pageSize,
    onPageSizeChange,
    paginationMetadata,
    onPageChange,
  } = usePaymentsTable();

  if (isError) {
    return (
      <div className="py-8 text-center text-muted-foreground">Unable to load payment history.</div>
    );
  }

  return (
    <DataTableShell
      showSearch={false}
      searchValue=""
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      paginationMetadata={paginationMetadata}
      onPageChange={onPageChange}
      isLoading={isDataLoading}
    >
      <Table
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        emptyState={
          isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-muted-foreground">
                No payments found.
              </td>
            </tr>
          ) : undefined
        }
      />
    </DataTableShell>
  );
};
