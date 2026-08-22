import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { bearer } from "better-auth/plugins";

import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

import { mikroOrmAdapter } from "./adapters/mikro-orm.adapter";
import { AUTH_ERROR_MESSAGES, BETTER_AUTH_BASE_PATH } from "./auth.constants";
import type { IBetterAuthInstance, ICreateBetterAuthInstanceOptions } from "./auth.interfaces";

export function createAuthInstance({
  orm,
}: ICreateBetterAuthInstanceOptions): IBetterAuthInstance {
  const isDevelopmentOrTesting =
    process.env.STAGE_ENV === "local" ||
    process.env.STAGE_ENV === "development" ||
    process.env.STAGE_ENV === "test";

  return betterAuth({
    database: mikroOrmAdapter(orm),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.API_BASE_URL,
    basePath: BETTER_AUTH_BASE_PATH,

    trustedOrigins: [process.env.WEB_CLIENT_BASE_URL],

    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      requireEmailVerification: false,
    },

    user: {
      
      additionalFields: {
        state: {
          type: "string",
          required: false,
          defaultValue: EUserState.ACTIVE,
          input: false,
        },
        role: {
          type: Object.values(EUserRole),
          required: false,
          input: false,
        },
        deletedAt: {
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

    plugins: [bearer()],

    logger: {
      level: "error",
    },

    advanced: {
      database: { generateId: false },
    },

    rateLimit: {
      enabled: !isDevelopmentOrTesting,
    },

    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const em = orm.em.fork();
            const user = await em.getRepository(User).findOne({ id: session.userId });

            if (!user || user.deletedAt) {
              throw new APIError("FORBIDDEN", {
                message: AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
              });
            }

            if (user.state === EUserState.INACTIVE) {
              throw new APIError("FORBIDDEN", {
                message: AUTH_ERROR_MESSAGES.ACCOUNT_DEACTIVATED,
              });
            }

            return { data: session };
          },
        },
      },
    },
  });
}