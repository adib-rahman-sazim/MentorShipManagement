import { useState } from "react";

import type { RowSelectionState } from "@tanstack/react-table";

import { Table } from "@/shared/components/DataTableShell/Table";

import { TUsersTableProps } from "./UsersTable.types";

const UsersTable = ({ data, columns }: TUsersTableProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  return (
    <Table
      data={data}
      columns={columns}
      enableRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      getRowId={(row) => row.id}
    />
  );
};

export default UsersTable;
