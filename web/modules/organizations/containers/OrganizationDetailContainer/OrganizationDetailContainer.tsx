import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { InviteUserDialog } from "@/modules/users/components/CreateUserDialog";
import { Button } from "@/shared/components/shadui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadui/dropdown-menu";
import FormSkeleton from "@/shared/components/skeletons/FormSkeleton";
import { ORGANIZATIONS_ROUTE } from "@/shared/constants/routes.constants";
import { organization } from "@/shared/lib/auth-client";
import { useCan } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useAppDispatch } from "@/shared/redux/hooks";
import projectApi from "@/shared/redux/rtk-apis/api.config";
import {
  useCancelInvitationMutation,
  useGetInvitationsQuery,
  useResendInvitationMutation,
} from "@/shared/redux/rtk-apis/invitations/invitations.api";
import { IInvitationResponse } from "@/shared/redux/rtk-apis/invitations/invitations.interfaces";
import {
  useGetOrganizationMembersQuery,
  useGetOrganizationsQuery,
} from "@/shared/redux/rtk-apis/organizations/organizations.api";
import { IOrganizationMemberResponse } from "@/shared/redux/rtk-apis/organizations/organizations.interfaces";
import { EPermission, EResource } from "@/shared/typedefs";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import {
  OrganizationInvitationsTable,
  OrganizationMembersTable,
} from "../../components/OrganizationDetailTables";
import {
  ORGANIZATION_INVITATIONS_PAGE_SIZE,
  ORGANIZATION_MEMBERS_DEFAULT_PAGE_SIZE,
  ORGANIZATION_MEMBERS_PAGE_SIZE_OPTIONS,
  PENDING_INVITATION_STATUS,
} from "./OrganizationDetailContainer.constants";

const OrganizationDetailContainer = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const organizationId = typeof router.query["id"] === "string" ? router.query["id"] : "";
  const { refetch: refetchAuth } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [activeOrgSetupId, setActiveOrgSetupId] = useState<string | null>(null);
  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize, setMembersPageSize] = useState(ORGANIZATION_MEMBERS_DEFAULT_PAGE_SIZE);
  const hasSetActiveOrg = activeOrgSetupId === organizationId;

  const { isAllowed: canCreateInvitation } = useCan(EPermission.CREATE, EResource.INVITATION);
  const { isAllowed: canCancelInvitation } = useCan(EPermission.CANCEL, EResource.INVITATION);

  const { data: organizationsPage, isLoading: isOrganizationsLoading } = useGetOrganizationsQuery({
    page: 1,
    limit: 100,
  });

  const currentOrganization = useMemo(
    () => organizationsPage?.data.find((org) => org.id === organizationId),
    [organizationsPage?.data, organizationId],
  );

  useEffect(() => {
    if (!organizationId || activeOrgSetupId === organizationId) {
      return;
    }

    let cancelled = false;

    const setActive = async () => {
      try {
        await organization.setActive({ organizationId });
        if (cancelled) {
          return;
        }
        await refetchAuth();
        dispatch(projectApi.util.invalidateTags(["Permissions"]));
        setActiveOrgSetupId(organizationId);
      } catch {
        if (!cancelled) {
          toast.error("Failed to set active organization");
        }
      }
    };

    setActive();

    return () => {
      cancelled = true;
    };
  }, [organizationId, activeOrgSetupId, refetchAuth, dispatch]);

  const {
    data: membersPageData,
    isLoading: isMembersLoading,
    isFetching: isMembersFetching,
  } = useGetOrganizationMembersQuery(
    {
      organizationId,
      page: membersPage,
      limit: membersPageSize,
    },
    {
      skip: !organizationId || !hasSetActiveOrg,
    },
  );

  const members = membersPageData?.data ?? [];
  const membersPaginationMetadata = membersPageData?.meta ?? {
    currentPage: membersPage,
    itemsPerPage: membersPageSize,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const handleMembersPageSizeChange = (nextPageSize: number) => {
    setMembersPageSize(nextPageSize);
    setMembersPage(1);
  };
  const { data: invitationsPage, isLoading: isInvitationsLoading } = useGetInvitationsQuery(
    {
      page: 1,
      limit: ORGANIZATION_INVITATIONS_PAGE_SIZE,
      status: PENDING_INVITATION_STATUS,
      organizationId,
    },
    {
      skip: !organizationId || !hasSetActiveOrg,
    },
  );

  const [resendInvitation] = useResendInvitationMutation();
  const [cancelInvitation] = useCancelInvitationMutation();

  const invitations = useMemo(
    () =>
      (invitationsPage?.data ?? []).filter(
        (invitation) => invitation.organization?.id === organizationId,
      ),
    [invitationsPage?.data, organizationId],
  );

  const handleResend = async (invitationId: string) => {
    try {
      const result = await resendInvitation(invitationId).unwrap();
      if (result.success) {
        toast.success("Invitation resent");
      } else {
        toast.error("Failed to resend invitation", { description: result.message });
      }
    } catch (error) {
      toast.error("Failed to resend invitation", {
        description: parseApiErrorMessage(error),
      });
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId).unwrap();
      toast.success("Invitation canceled");
    } catch (error) {
      toast.error("Failed to cancel invitation", {
        description: parseApiErrorMessage(error),
      });
    }
  };

  const membersColumns: ColumnDef<IOrganizationMemberResponse>[] = [
    {
      accessorKey: "user.email",
      header: "Email",
      cell: ({ row }) => row.original.user.email,
    },
    {
      accessorKey: "user.name",
      header: "Name",
      cell: ({ row }) => row.original.user.name,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => row.original.role ?? "—",
    },
  ];

  const invitationsColumns: ColumnDef<IInvitationResponse>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => row.original.role,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status,
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => format(parseISO(row.original.expiresAt), "P"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canCreateInvitation ? (
              <DropdownMenuItem onClick={() => handleResend(row.original.id)}>
                Resend
              </DropdownMenuItem>
            ) : null}
            {canCancelInvitation ? (
              <DropdownMenuItem onClick={() => handleCancel(row.original.id)}>
                Cancel
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (!router.isReady || isOrganizationsLoading) {
    return <FormSkeleton fields={6} />;
  }

  if (!organizationId) {
    return null;
  }

  if (!currentOrganization && !isOrganizationsLoading) {
    return (
      <div className="container py-4">
        <p>Organization not found.</p>
        <Button variant="outline" onClick={() => router.push(ORGANIZATIONS_ROUTE)}>
          Back to Organizations
        </Button>
      </div>
    );
  }

  if (!hasSetActiveOrg || isMembersLoading || isInvitationsLoading || isMembersFetching) {
    return <FormSkeleton fields={6} />;
  }

  return (
    <div className="container py-4 space-y-8">
      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        organizationId={organizationId}
      />

      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2 px-0"
            onClick={() => router.push(ORGANIZATIONS_ROUTE)}
          >
            ← Organizations
          </Button>
          <h3 className="text text-primary text-4xl font-bold">{currentOrganization?.name}</h3>
          <p className="text-sm text-muted-foreground">{currentOrganization?.slug}</p>
        </div>
        {canCreateInvitation ? (
          <Button onClick={() => setIsInviteDialogOpen(true)}>Invite User</Button>
        ) : null}
      </div>

      <section className="space-y-4">
        <h4 className="text-xl font-semibold">Members</h4>
        <OrganizationMembersTable
          data={members}
          columns={membersColumns}
          pageSize={membersPageSize}
          pageSizeOptions={ORGANIZATION_MEMBERS_PAGE_SIZE_OPTIONS}
          paginationMetadata={membersPaginationMetadata}
          onPageChange={setMembersPage}
          onPageSizeChange={handleMembersPageSizeChange}
          isLoading={isMembersLoading || isMembersFetching}
        />
      </section>

      <section className="space-y-4">
        <h4 className="text-xl font-semibold">Pending Invitations</h4>
        <OrganizationInvitationsTable data={invitations} columns={invitationsColumns} />
      </section>
    </div>
  );
};

export default OrganizationDetailContainer;
