import type { IPageSizeOption } from "@/shared/components/DataTableShell/components/DataTableContent";
import { EInvitationStatus } from "@/shared/redux/rtk-apis/invitations/invitations.enums";

export const ORGANIZATION_INVITATIONS_PAGE_SIZE = 50;
export const PENDING_INVITATION_STATUS = EInvitationStatus.PENDING;

export const ORGANIZATION_MEMBERS_DEFAULT_PAGE_SIZE = 10;

export const ORGANIZATION_MEMBERS_PAGE_SIZE_OPTIONS: IPageSizeOption[] = [5, 10, 20, 50, 100].map(
  (value) => ({
    value,
    label: String(value),
  }),
);
