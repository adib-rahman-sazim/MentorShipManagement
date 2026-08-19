import { Table } from "@/shared/components/DataTableShell/Table";

import { TOrganizationsTableProps } from "./OrganizationsTable.types";

const OrganizationsTable = ({ data, columns }: TOrganizationsTableProps) => (
  <Table data={data} columns={columns} getRowId={(row) => row.id} />
);

export default OrganizationsTable;
