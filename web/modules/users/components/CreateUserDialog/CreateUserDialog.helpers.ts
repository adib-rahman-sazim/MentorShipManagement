import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ICreateInvitationDto } from "@/shared/redux/rtk-apis/invitations/invitations.interfaces";
import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";
import { EPermission, EResource } from "@/shared/typedefs";

import {
  INVITE_ORGANIZATION_NOT_ALLOWED_MESSAGE,
  INVITE_ORGANIZATION_REQUIRED_MESSAGE,
  INVITE_USER_ROLE_OPTIONS,
} from "./CreateUserDialog.constants";

export const inviteUserFormInitialValues: ICreateInvitationDto = {
  email: "",
  firstName: "",
  lastName: "",
  role: EUserRole.CUSTOMER,
};

export const inviteUserFormValidationSchema: z.ZodType<ICreateInvitationDto> = z
  .object({
    email: z.string().email("Invalid email").min(1, "Required"),
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    role: z.nativeEnum(EUserRole),
    organizationId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === EUserRole.CUSTOMER) {
      if (!data.organizationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: INVITE_ORGANIZATION_REQUIRED_MESSAGE,
          path: ["organizationId"],
        });
      }
      return;
    }

    if (data.organizationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: INVITE_ORGANIZATION_NOT_ALLOWED_MESSAGE,
        path: ["organizationId"],
      });
    }
  });

export const inviteUserFormResolver = zodResolver(inviteUserFormValidationSchema);

export const getInviteRoleOptionsForAbility = (
  can: (action: EPermission, resource: EResource | "all") => boolean,
): Array<{ value: EUserRole; label: string }> => {
  const isSuperuserUi =
    can(EPermission.MANAGE, EResource.ALL) || can(EPermission.DELETE, EResource.ORGANIZATION);

  if (isSuperuserUi) {
    return INVITE_USER_ROLE_OPTIONS;
  }

  const isManagerLike =
    can(EPermission.CREATE, EResource.INVITATION) && can(EPermission.UPDATE, EResource.USER);

  if (isManagerLike) {
    return INVITE_USER_ROLE_OPTIONS.filter((option) => option.value !== EUserRole.SUPER_ADMIN);
  }

  return INVITE_USER_ROLE_OPTIONS.filter((option) => option.value === EUserRole.CUSTOMER);
};

export const buildCreateInvitationPayload = (
  values: ICreateInvitationDto,
  organizationIdProp?: string,
): ICreateInvitationDto => {
  const payload: ICreateInvitationDto = {
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    role: values.role,
  };

  if (values.role === EUserRole.CUSTOMER) {
    const organizationId = organizationIdProp ?? values.organizationId;
    if (organizationId) {
      payload.organizationId = organizationId;
    }
  }

  return payload;
};
