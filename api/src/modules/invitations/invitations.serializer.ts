import { Injectable } from "@nestjs/common";

import type { Invitation } from "@/common/entities/invitations.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
import { AbstractBaseSerializer } from "@/common/serializers/abstract-base.serializer";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

import type {
  CreateInvitationResultResponse,
  OrganizationInvitationValidationResponse,
  SystemInvitationValidationResponse,
} from "./invitations.responses";

@Injectable()
export class InvitationsSerializer extends AbstractBaseSerializer {
  private readonly commonSerializationOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    populate: ["organization", "inviter"],
    exclude: [
      "updatedAt",
      "token",
      "organization.createdAt",
      "organization.updatedAt",
      "organization.slug",
      "organization.logo",
      "organization.metadata",
      "organization.members",
      "organization.invitations",
      "organization.createdBy",
      "inviter.createdAt",
      "inviter.updatedAt",
      "inviter.emailVerified",
      "inviter.firstName",
      "inviter.lastName",
      "inviter.image",
      "inviter.state",
      "inviter.firstLoginAt",
      "inviter.sessions",
      "inviter.accounts",
      "inviter.memberships",
    ],
  };

  protected serializeOneOptions: TSerializationOptions = this.commonSerializationOptions;

  protected serializeManyOptions: TSerializationOptions = this.commonSerializationOptions;

  serializeCreateResult(email: string, invitationId?: string): CreateInvitationResultResponse {
    return {
      success: true,
      message: `Invitation sent to ${email}`,
      invitationId,
    };
  }

  serializeResendResult(email: string, invitationId?: string): CreateInvitationResultResponse {
    return {
      success: true,
      message: `Invitation resent to ${email}`,
      invitationId,
    };
  }

  serializeSystemValidation(invitation: Invitation): SystemInvitationValidationResponse {
    return {
      email: invitation.email,
      firstName: invitation.firstName ?? undefined,
      lastName: invitation.lastName ?? undefined,
      role: invitation.role as EUserRole,
      inviterEmail: invitation.inviter.email,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    };
  }

  serializeOrganizationValidation(
    invitation: Invitation,
  ): OrganizationInvitationValidationResponse {
    return {
      email: invitation.email,
      firstName: invitation.firstName ?? undefined,
      lastName: invitation.lastName ?? undefined,
      role: invitation.role as EUserRole,
      inviterEmail: invitation.inviter.email,
      organizationName: invitation.organization!.name,
      organizationSlug: invitation.organization!.slug,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    };
  }
}
