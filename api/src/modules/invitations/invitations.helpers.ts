export * from "./invitations.constants";
export * from "./invitations.enums";

import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { APIError } from "better-auth/api";

import { EUserRole } from "@/common/enums/roles.enums";
import {
  isOrganizationBoundRole,
  isSystemLevelRole,
} from "@/modules/permissions/permissions.role-priority.helpers";

import { INVITATION_ERROR_MESSAGES, INVITATION_PERMISSION_MATRIX } from "./invitations.constants";
import type { TInvitationValidationResult } from "./invitations.types";

export { isOrganizationBoundRole, isSystemLevelRole };

export function canInviteRole(inviterRole: EUserRole, targetRole: EUserRole): boolean {
  const allowedRoles = INVITATION_PERMISSION_MATRIX[inviterRole];
  return allowedRoles.includes(targetRole);
}

export function normalizeInvitationEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function areInvitationEmailsEqual(
  firstEmail: string | null | undefined,
  secondEmail: string | null | undefined,
): boolean {
  if (!firstEmail || !secondEmail) {
    return false;
  }

  return normalizeInvitationEmail(firstEmail) === normalizeInvitationEmail(secondEmail);
}

export function buildInvitationRecipientName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallbackEmail: string,
): string {
  const trimmedFirstName = firstName?.trim() ?? "";
  const trimmedLastName = lastName?.trim() ?? "";

  if (!trimmedFirstName) {
    return fallbackEmail;
  }

  if (!trimmedLastName || trimmedFirstName === trimmedLastName) {
    return trimmedFirstName;
  }

  return `${trimmedFirstName} ${trimmedLastName}`;
}

export function validateInvitationRules({
  inviterRole,
  targetRole,
  organizationId,
}: {
  inviterRole: EUserRole;
  inviterEmail?: string | null;
  targetEmail?: string;
  targetRole: EUserRole;
  organizationId?: string;
}): TInvitationValidationResult {
  if (!canInviteRole(inviterRole, targetRole)) {
    return {
      valid: false,
      error: INVITATION_ERROR_MESSAGES.ROLE_NOT_ALLOWED(inviterRole, targetRole),
    };
  }

  if (isSystemLevelRole(targetRole) && organizationId) {
    return {
      valid: false,
      error: INVITATION_ERROR_MESSAGES.ORGANIZATION_NOT_ALLOWED,
    };
  }

  if (isOrganizationBoundRole(targetRole) && !organizationId) {
    return {
      valid: false,
      error: INVITATION_ERROR_MESSAGES.ORGANIZATION_REQUIRED,
    };
  }

  return { valid: true };
}

export function getEffectiveOrganizationId({
  targetRole,
  orgIdFromDto,
  orgIdFromInvitationContext,
}: {
  targetRole: EUserRole;
  orgIdFromDto?: string;
  orgIdFromInvitationContext?: string;
}): string | undefined {
  if (targetRole === EUserRole.CUSTOMER) {
    return orgIdFromDto ?? orgIdFromInvitationContext;
  }

  return orgIdFromDto;
}

export function handleBetterAuthApiError(error: unknown, fallbackMessage: string): never {
  if (error instanceof APIError) {
    const message = error.body?.message || fallbackMessage;
    if (error.status === "FORBIDDEN") {
      throw new ForbiddenException(message);
    }
    if (error.status === "NOT_FOUND" || message.toLowerCase().includes("not found")) {
      throw new NotFoundException(message);
    }
    throw new BadRequestException(message);
  }
  throw new InternalServerErrorException(error instanceof Error ? error.message : fallbackMessage);
}

export function convertExpressHeadersToHeaders(
  expressHeaders: Record<string, string | string[] | undefined>,
): Headers {
  const headers = new Headers();
  Object.entries(expressHeaders).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  return headers;
}
