import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { randomBytes } from "crypto";
import dayjs from "dayjs";

import type { EUserRole } from "@/common/enums/roles.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { createAuthEmailSenders } from "@/modules/auth/auth.helpers";
import { AuthService } from "@/modules/auth/auth.service";
import type { IEmailService } from "@/modules/emails/email-service.interfaces";
import { EMAIL_SERVICE_TOKEN } from "@/modules/emails/emails.constants";
import { isSystemLevelRole } from "@/modules/permissions/permissions.role-priority.helpers";

import { EInvitationStatus } from "../invitations.enums";
import {
  buildInvitationRecipientName,
  handleBetterAuthApiError,
  INVITATION_ERROR_MESSAGES,
  INVITATION_EXPIRY_DAYS,
  SYSTEM_INVITATION_ACCEPT_PATH,
  validateInvitationRules,
} from "../invitations.helpers";
import type { IResendInvitationContext } from "../invitations.interfaces";
import { InvitationsRepository } from "../invitations.repository";
import type { CreateInvitationResultResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class ResendInvitationInteractor
  implements IBaseInteractor<IResendInvitationContext, CreateInvitationResultResponse>
{
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly invitationsSerializer: InvitationsSerializer,
    @Inject(EMAIL_SERVICE_TOKEN)
    private readonly emailService: IEmailService,
  ) {}

  async execute({
    id,
    context,
    headers,
  }: IResendInvitationContext): Promise<CreateInvitationResultResponse> {
    const invitation = await this.invitationsRepository.findByIdForActor({
      id,
      organizationId: context.organizationId,
      includeAllOrganizations: isSystemLevelRole(context.inviterRole),
    });

    if (!invitation) {
      throw new NotFoundException(INVITATION_ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    if (invitation.status === EInvitationStatus.CANCELED) {
      throw new BadRequestException(INVITATION_ERROR_MESSAGES.INVITATION_CANCELED);
    }

    if (invitation.status === EInvitationStatus.ACCEPTED) {
      throw new BadRequestException(INVITATION_ERROR_MESSAGES.INVITATION_ALREADY_ACCEPTED);
    }

    const targetRole = invitation.role as EUserRole;
    const validationResult = validateInvitationRules({
      inviterRole: context.inviterRole,
      targetRole,
      organizationId: invitation.organization?.id,
    });

    if (!validationResult.valid) {
      throw new ForbiddenException(
        `You do not have permission to resend invitations for role '${targetRole}'`,
      );
    }

    invitation.expiresAt = dayjs().add(INVITATION_EXPIRY_DAYS, "day").toDate();

    if (!invitation.organization) {
      invitation.token = randomBytes(32).toString("hex");
      await this.invitationsRepository.flush();

      const webClientBaseUrl = this.configService.getOrThrow<string>("WEB_CLIENT_BASE_URL");
      const emailSenders = createAuthEmailSenders(this.emailService, webClientBaseUrl);
      const acceptUrl = new URL(SYSTEM_INVITATION_ACCEPT_PATH, webClientBaseUrl);
      acceptUrl.searchParams.set("token", invitation.token);

      await emailSenders.sendSystemInvitationEmail({
        to: invitation.email,
        name: buildInvitationRecipientName(
          invitation.firstName,
          invitation.lastName,
          invitation.email,
        ),
        role: targetRole,
        inviterName: context.inviterEmail,
        acceptUrl: acceptUrl.toString(),
      });

      return this.invitationsSerializer.serializeResendResult(invitation.email, invitation.id);
    }

    await this.invitationsRepository.flush();

    try {
      await this.authService.auth.api.createInvitation({
        headers,
        body: {
          email: invitation.email,
          role: [targetRole],
          organizationId: invitation.organization.id,
          resend: true,
        },
      });

      return this.invitationsSerializer.serializeResendResult(invitation.email, invitation.id);
    } catch (error) {
      handleBetterAuthApiError(error, "Failed to resend invitation");
    }
  }
}
