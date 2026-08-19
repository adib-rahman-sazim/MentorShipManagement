import { ColumnDef } from "@tanstack/react-table";

import { IOrganizationResponse } from "@/shared/redux/rtk-apis/organizations/organizations.interfaces";

export type TOrganizationsTableProps = {
  data: IOrganizationResponse[];
  columns: ColumnDef<IOrganizationResponse>[];
};
