import { ColumnDef } from "@tanstack/react-table";

import type { IPageSizeOption } from "@/shared/components/DataTableShell/components/DataTableContent";
import { IInvitationResponse } from "@/shared/redux/rtk-apis/invitations/invitations.interfaces";
import { IOrganizationMemberResponse } from "@/shared/redux/rtk-apis/organizations/organizations.interfaces";
import type { TPaginationMetadata } from "@/shared/typedefs";

export type TOrganizationMembersTableProps = {
  data: IOrganizationMemberResponse[];
  columns: ColumnDef<IOrganizationMemberResponse>[];
  pageSize: number;
  pageSizeOptions: IPageSizeOption[];
  paginationMetadata: TPaginationMetadata;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
};

export type TOrganizationInvitationsTableProps = {
  data: IInvitationResponse[];
  columns: ColumnDef<IInvitationResponse>[];
};
