import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { bearer, organization } from "better-auth/plugins";

import { Invitation } from "@/common/entities/invitations.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { normalizeInvitationEmail } from "@/modules/invitations/invitations.helpers";
import { ac, customer, manager, super_admin } from "@/modules/permissions/permissions.constants";

import { mikroOrmAdapter } from "./adapters/mikro-orm.adapter";
import { BETTER_AUTH_BASE_PATH, SELF_SIGNUP_ALLOWED_ROLES } from "./auth.constants";
import { createAuthEmailSenders } from "./auth.helpers";
import type { IBetterAuthInstance, ICreateBetterAuthInstanceOptions } from "./auth.interfaces";

export function createAuthInstance({
  orm,
  emailService,
  authInvitationProcessor,
  authOrganizationHooks,
}: ICreateBetterAuthInstanceOptions): IBetterAuthInstance {
  const webClientBaseUrl = process.env.WEB_CLIENT_BASE_URL;
  const emailSenders = createAuthEmailSenders(emailService, webClientBaseUrl);
  const isDevelopmentOrTesting =
    process.env.STAGE_ENV === "test" || process.env.STAGE_ENV === "development";

  return betterAuth({
    database: mikroOrmAdapter(orm),

    baseURL: process.env.API_BASE_URL,
    basePath: BETTER_AUTH_BASE_PATH,

    trustedOrigins: [webClientBaseUrl],

    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, token }) => {
        await emailSenders.sendResetPasswordEmail(user, token);
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, token }) => {
        await emailSenders.sendVerificationEmail(user, token);
      },
    },

    user: {
      additionalFields: {
        firstName: {
          type: "string",
          required: true,
          input: true,
        },
        lastName: {
          type: "string",
          required: true,
          input: true,
        },
        state: {
          type: "string",
          required: false,
          defaultValue: "ACTIVE",
          input: false,
        },
        firstLoginAt: {
          type: "date",
          required: false,
          input: false,
        },
      },
    },

    session: {
      expiresIn: Number(process.env.SESSION_EXPIRES_IN),
      updateAge: Number(process.env.SESSION_UPDATE_AGE),
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        mapProfileToUser: (profile) => {
          const nameParts = (profile.name || "").split(" ");
          const firstName = nameParts[0] || profile.given_name || "";
          const lastName = nameParts.slice(1).join(" ") || profile.family_name || "";

          return {
            firstName,
            lastName,
          };
        },
      },
    },

    plugins: [
      bearer(),
      organization({
        ac,
        roles: {
          super_admin,
          manager,
          customer,
        },
        creatorRole: EUserRole.CUSTOMER,
        allowUserToCreateOrganization: async (user) =>
          authOrganizationHooks.canUserCreateOrganization(orm.em.fork(), user.id),
        sendInvitationEmail: emailSenders.sendInvitationEmail,
        organizationHooks: {
          afterAcceptInvitation: authOrganizationHooks.createAfterAcceptInvitationHook(
            orm.em.fork(),
          ),
          afterCreateOrganization: authOrganizationHooks.createAfterCreateOrganizationHook(
            orm.em.fork(),
          ),
        },
      }),
    ],

    logger: {
      level: "error",
    },

    advanced: {
      database: { generateId: false },
    },

    rateLimit: {
      enabled: !isDevelopmentOrTesting,
    },

    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path.startsWith("/sign-up/email")) {
          if (typeof ctx.body.email === "string") {
            ctx.body.email = normalizeInvitationEmail(ctx.body.email);
          }

          const invitationToken = authInvitationProcessor.getInvitationProofFromHeaders(
            ctx.request?.headers,
          );
          if (invitationToken) {
            const forkedEm = orm.em.fork();
            const invitation = await authInvitationProcessor.validateSystemInvitationProofForSignup(
              forkedEm,
              invitationToken,
              ctx.body.email as string,
            );
            (ctx.context as Record<string, unknown>)._systemInvitationId = invitation.id;
            (ctx.context as Record<string, unknown>)._systemInvitationRole = invitation.role;
          }
        }
      }),

      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path.startsWith("/sign-up/email") && typeof ctx.body.email === "string") {
          const email = normalizeInvitationEmail(ctx.body.email);
          const forkedEm = orm.em.fork();
          const usersRepository = forkedEm.getRepository(User);
          const invitationsRepository = forkedEm.getRepository(Invitation);
          const user = await usersRepository.findOne({ email });

          if (user) {
            const systemInvitationId = (ctx.context as Record<string, unknown>)
              ._systemInvitationId as string | undefined;
            const systemInvitationRole = (ctx.context as Record<string, unknown>)
              ._systemInvitationRole as EUserRole | undefined;

            if (systemInvitationId && systemInvitationRole) {
              const invitation = await invitationsRepository.findOne({ id: systemInvitationId });

              await authInvitationProcessor.finalizeUserSignup(forkedEm, {
                userId: user.id,
                targetRole: systemInvitationRole,
                invitation,
                organizationId: null,
              });
            } else if (SELF_SIGNUP_ALLOWED_ROLES.includes(EUserRole.CUSTOMER)) {
              await authInvitationProcessor.finalizeUserSignup(forkedEm, {
                userId: user.id,
                targetRole: EUserRole.CUSTOMER,
                invitation: null,
                organizationId: null,
              });
            }
          }
        }

        if (ctx.path.startsWith("/callback")) {
          const newSession = ctx.context.newSession;
          if (newSession?.user?.id) {
            const forkedEm = orm.em.fork();
            const userRolesRepository = forkedEm.getRepository(UserRole);
            const existingRoleCount = await userRolesRepository.count({
              user: { id: newSession.user.id },
            });
            if (existingRoleCount === 0 && SELF_SIGNUP_ALLOWED_ROLES.includes(EUserRole.CUSTOMER)) {
              await authInvitationProcessor.finalizeUserSignup(forkedEm, {
                userId: newSession.user.id,
                targetRole: EUserRole.CUSTOMER,
                invitation: null,
                organizationId: null,
              });
            }
          }

          if (newSession?.session?.token) {
            const token = newSession.session.token;
            const callbackURL = `${webClientBaseUrl}/auth/callback`;
            const separator = callbackURL.includes("?") ? "&" : "?";
            throw ctx.redirect(`${callbackURL}${separator}token=${token}`);
          }
        }
      }),
    },

    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const em = orm.em.fork();
            const usersRepository = em.getRepository(User);
            const user = await usersRepository.findOne({ id: session.userId });

            if (user?.state === EUserState.INACTIVE) {
              throw new APIError("FORBIDDEN", {
                message: "Your account has been deactivated. Please contact an administrator.",
              });
            }

            return { data: session };
          },
        },
      },
      member: {
        create: {
          before: authOrganizationHooks.createMemberCreateBeforeHook(),
          after: authOrganizationHooks.createMemberCreateAfterHook(orm.em.fork()),
        },
      },
    },
  });
}
