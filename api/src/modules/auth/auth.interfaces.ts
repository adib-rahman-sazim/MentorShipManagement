import type { MikroORM } from "@mikro-orm/postgresql";

import type { EUserRole } from "@/common/enums/roles.enums";
import type { IEmailService } from "@/modules/emails/email-service.interfaces";

export interface IUserEmailData {
  email: string;
  name?: string | null;
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
        role?: EUserRole | null;
        state?: string | null;
        firstLoginAt?: Date | null;
      };
    } | null>;
  };
}

export interface ICreateBetterAuthInstanceOptions {
  orm: MikroORM;
  emailService: IEmailService;
}
