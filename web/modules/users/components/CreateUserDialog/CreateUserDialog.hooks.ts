import { useEffect, useMemo } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAbilityContext } from "@/shared/providers/AbilityProvider";
import { useCreateInvitationMutation } from "@/shared/redux/rtk-apis/invitations/invitations.api";
import { ICreateInvitationDto } from "@/shared/redux/rtk-apis/invitations/invitations.interfaces";
import { useGetOrganizationsQuery } from "@/shared/redux/rtk-apis/organizations/organizations.api";
import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import { INVITE_ORGANIZATIONS_PAGE_SIZE } from "./CreateUserDialog.constants";
import {
  buildCreateInvitationPayload,
  getInviteRoleOptionsForAbility,
  inviteUserFormInitialValues,
  inviteUserFormResolver,
} from "./CreateUserDialog.helpers";

export const useInviteUserForm = ({
  onOpenChange,
  organizationId,
}: {
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
}) => {
  const { ability } = useAbilityContext();
  const roleOptions = useMemo(
    () => getInviteRoleOptionsForAbility((action, resource) => ability.can(action, resource)),
    [ability],
  );

  const {
    data: organizationsPage,
    isLoading: isOrganizationsLoading,
    isFetching: isOrganizationsFetching,
  } = useGetOrganizationsQuery(
    { page: 1, limit: INVITE_ORGANIZATIONS_PAGE_SIZE },
    { skip: Boolean(organizationId) },
  );

  const organizationOptions = useMemo(
    () =>
      (organizationsPage?.data ?? []).map((organization) => ({
        value: organization.id,
        label: organization.name,
      })),
    [organizationsPage?.data],
  );

  const form = useForm<ICreateInvitationDto>({
    defaultValues: {
      ...inviteUserFormInitialValues,
      role: organizationId
        ? EUserRole.CUSTOMER
        : (roleOptions[0]?.value ?? inviteUserFormInitialValues.role),
      organizationId,
    },
    resolver: inviteUserFormResolver,
  });

  const watchedRole = form.watch("role");

  useEffect(() => {
    const defaultRole = organizationId
      ? EUserRole.CUSTOMER
      : (roleOptions[0]?.value ?? inviteUserFormInitialValues.role);
    form.reset({
      ...inviteUserFormInitialValues,
      role: defaultRole,
      organizationId,
    });
  }, [form, organizationId, roleOptions]);

  useEffect(() => {
    if (watchedRole !== EUserRole.CUSTOMER) {
      form.setValue("organizationId", undefined);
      return;
    }

    if (organizationId) {
      form.setValue("organizationId", organizationId);
    }
  }, [form, organizationId, watchedRole]);

  const [createInvitation] = useCreateInvitationMutation();

  const onSubmit = async (values: ICreateInvitationDto) => {
    try {
      const result = await createInvitation(
        buildCreateInvitationPayload(values, organizationId),
      ).unwrap();
      if (result.success) {
        toast.success("Invitation sent successfully");
        form.reset({
          ...inviteUserFormInitialValues,
          role: roleOptions[0]?.value ?? inviteUserFormInitialValues.role,
          organizationId,
        });
        onOpenChange(false);
      } else {
        toast.error("Failed to invite user", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Failed to invite user", {
        description: parseApiErrorMessage(error),
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    roleOptions,
    watchedRole,
    organizationOptions,
    isOrganizationsLoading: isOrganizationsLoading || isOrganizationsFetching,
    hasOrganizationOptions: organizationOptions.length > 0,
  };
};
