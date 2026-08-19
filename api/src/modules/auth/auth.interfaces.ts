import type { MikroORM } from "@mikro-orm/postgresql";

import type { Invitation } from "@/common/entities/invitations.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
import type { IEmailService } from "@/modules/emails/email-service.interfaces";

import type { AuthOrganizationHooks } from "./auth.organization.hooks";
import type { AuthInvitationProcessor } from "./auth-invitation.processor";

export interface IUserEmailData {
  email: string;
  name?: string | null;
}

export interface IInvitationEmailData {
  id: string;
  email: string;
  inviter: {
    user: {
      name?: string | null;
      email: string;
    };
  };
  organization: {
    name: string;
  };
}

export interface ISystemInvitationEmailData {
  to: string;
  name: string;
  role: EUserRole;
  inviterName: string;
  acceptUrl: string;
}

export interface IFinalizeUserSignupContext {
  userId: string;
  targetRole: EUserRole;
  invitation?: Invitation | null;
  organizationId?: string | null;
  consumeInvitation?: boolean;
}

export interface IBetterAuthInstance {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (options: { headers: Headers }) => Promise<{
      session: {
        id: string;
        token: string;
        userId: string;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
        activeOrganizationId?: string | null;
        activeOrganizationRole?: string | null;
      };
      user: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        image?: string | null;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        state?: string | null;
        firstLoginAt?: Date | null;
      };
    } | null>;
    createInvitation: (options: {
      headers: Headers;
      body: {
        email: string;
        role: EUserRole[];
        organizationId?: string;
        resend?: boolean;
      };
    }) => Promise<{ id: string }>;
  };
}

export interface ICreateBetterAuthInstanceOptions {
  orm: MikroORM;
  emailService: IEmailService;
  authInvitationProcessor: AuthInvitationProcessor;
  authOrganizationHooks: AuthOrganizationHooks;
}
