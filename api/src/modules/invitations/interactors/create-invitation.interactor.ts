import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { randomBytes } from "crypto";
import dayjs from "dayjs";

import { EUserRole } from "@/common/enums/roles.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { createAuthEmailSenders } from "@/modules/auth/auth.helpers";
import { AuthService } from "@/modules/auth/auth.service";
import type { IEmailService } from "@/modules/emails/email-service.interfaces";
import { EMAIL_SERVICE_TOKEN } from "@/modules/emails/emails.constants";
import { OrganizationsRepository } from "@/modules/organizations/organizations.repository";
import { resolveEffectiveRole } from "@/modules/permissions/permissions.role-priority.helpers";

import {
  buildInvitationRecipientName,
  getEffectiveOrganizationId,
  handleBetterAuthApiError,
  INVITATION_ERROR_MESSAGES,
  INVITATION_EXPIRY_DAYS,
  isSystemLevelRole,
  normalizeInvitationEmail,
  SYSTEM_INVITATION_ACCEPT_PATH,
  validateInvitationRules,
} from "../invitations.helpers";
import type { ICreateInvitationContext } from "../invitations.interfaces";
import { InvitationsRepository } from "../invitations.repository";
import type { CreateInvitationResultResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class CreateInvitationInteractor
  implements IBaseInteractor<ICreateInvitationContext, CreateInvitationResultResponse>
{
  private readonly logger = new Logger(CreateInvitationInteractor.name);

  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly invitationsSerializer: InvitationsSerializer,
    @Inject(EMAIL_SERVICE_TOKEN)
    private readonly emailService: IEmailService,
  ) {}

  async execute({
    dto,
    context,
    headers,
  }: ICreateInvitationContext): Promise<CreateInvitationResultResponse> {
    if (isSystemLevelRole(dto.role)) {
      return this.createSystemInvitation({ dto, context, headers });
    }

    return this.createOrganizationInvitation({ dto, context, headers });
  }

  private async createSystemInvitation({
    dto,
    context,
  }: ICreateInvitationContext): Promise<CreateInvitationResultResponse> {
    const { inviterRole, inviterEmail, inviterId } = context;
    const targetRole = dto.role;
    const normalizedEmail = normalizeInvitationEmail(dto.email);

    const validationResult = validateInvitationRules({
      inviterRole,
      targetRole,
      organizationId: dto.organizationId,
    });

    if (!validationResult.valid) {
      throw new ForbiddenException(validationResult.error);
    }

    const existingInvitation = await this.invitationsRepository.findPendingByEmail(
      normalizedEmail,
      undefined,
      true,
    );

    if (existingInvitation) {
      throw new BadRequestException(INVITATION_ERROR_MESSAGES.INVITATION_ALREADY_EXISTS);
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = dayjs().add(INVITATION_EXPIRY_DAYS, "day").toDate();

    const invitation = this.invitationsRepository.createSystemInvitation({
      email: normalizedEmail,
      role: targetRole,
      expiresAt,
      inviterId,
      token,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    await this.invitationsRepository.flush();

    const webClientBaseUrl = this.configService.getOrThrow<string>("WEB_CLIENT_BASE_URL");
    const emailSenders = createAuthEmailSenders(this.emailService, webClientBaseUrl);
    const acceptUrl = new URL(SYSTEM_INVITATION_ACCEPT_PATH, webClientBaseUrl);
    acceptUrl.searchParams.set("token", token);

    await emailSenders.sendSystemInvitationEmail({
      to: normalizedEmail,
      name: buildInvitationRecipientName(dto.firstName, dto.lastName, normalizedEmail),
      role: targetRole,
      inviterName: inviterEmail,
      acceptUrl: acceptUrl.toString(),
    });

    this.logger.log(`System invitation sent to ${normalizedEmail} for role: ${targetRole}`);

    return this.invitationsSerializer.serializeCreateResult(normalizedEmail, invitation.id);
  }

  private async createOrganizationInvitation({
    dto,
    context,
    headers,
  }: ICreateInvitationContext): Promise<CreateInvitationResultResponse> {
    const { inviterRole, inviterId, organizationId } = context;
    const targetRole = dto.role;
    const normalizedEmail = normalizeInvitationEmail(dto.email);

    const effectiveOrgId = getEffectiveOrganizationId({
      targetRole,
      orgIdFromDto: dto.organizationId,
      orgIdFromInvitationContext: organizationId,
    });

    const validationResult = validateInvitationRules({
      inviterRole,
      targetRole,
      organizationId: effectiveOrgId,
    });

    if (!validationResult.valid) {
      throw new ForbiddenException(validationResult.error);
    }

    if (!effectiveOrgId) {
      throw new BadRequestException(INVITATION_ERROR_MESSAGES.NO_ACTIVE_ORGANIZATION);
    }

    const organization = await this.organizationsRepository.findById(effectiveOrgId);
    if (!organization) {
      throw new NotFoundException(INVITATION_ERROR_MESSAGES.ORGANIZATION_NOT_FOUND);
    }

    if (resolveEffectiveRole([inviterRole]) === EUserRole.CUSTOMER) {
      if (!organization.createdBy || organization.createdBy.id !== inviterId) {
        throw new ForbiddenException(INVITATION_ERROR_MESSAGES.CUSTOMER_MUST_BE_ORG_CREATOR);
      }
    }

    const existingInvitation = await this.invitationsRepository.findPendingByEmail(
      normalizedEmail,
      effectiveOrgId,
    );

    if (existingInvitation) {
      throw new BadRequestException(INVITATION_ERROR_MESSAGES.INVITATION_ALREADY_EXISTS);
    }

    if (isSystemLevelRole(inviterRole)) {
      const invitation = this.invitationsRepository.createOrganizationInvitation({
        email: normalizedEmail,
        role: EUserRole.CUSTOMER,
        expiresAt: dayjs().add(INVITATION_EXPIRY_DAYS, "day").toDate(),
        inviterId,
        organizationId: effectiveOrgId,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      await this.invitationsRepository.flush();

      const webClientBaseUrl = this.configService.getOrThrow<string>("WEB_CLIENT_BASE_URL");
      const emailSenders = createAuthEmailSenders(this.emailService, webClientBaseUrl);
      await emailSenders.sendInvitationEmail({
        id: invitation.id,
        email: normalizedEmail,
        organization: { name: organization.name },
        inviter: {
          user: {
            name: context.inviterEmail,
            email: context.inviterEmail,
          },
        },
      });

      return this.invitationsSerializer.serializeCreateResult(normalizedEmail, invitation.id);
    }

    try {
      const result = await this.authService.auth.api.createInvitation({
        headers,
        body: {
          email: normalizedEmail,
          role: [EUserRole.CUSTOMER],
          organizationId: effectiveOrgId,
        },
      });

      if (dto.firstName || dto.lastName) {
        const invitation = await this.invitationsRepository.findByIdOrFail(result.id);
        if (dto.firstName) {
          invitation.firstName = dto.firstName;
        }
        if (dto.lastName) {
          invitation.lastName = dto.lastName;
        }
        await this.invitationsRepository.flush();
      }

      return this.invitationsSerializer.serializeCreateResult(normalizedEmail, result.id);
    } catch (error) {
      handleBetterAuthApiError(error, "Failed to send invitation");
    }
  }
}
