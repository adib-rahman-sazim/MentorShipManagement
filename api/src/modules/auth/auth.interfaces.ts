import type { MikroORM } from "@mikro-orm/postgresql";

import type { EUserRole } from "@/common/enums/roles.enums";

export interface IAuthSessionUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  state?: string | null;
  deletedAt?: Date | null;
  role?: EUserRole | null;
}

export interface IAuthSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface IBetterAuthInstance {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (options: { headers: Headers }) => Promise<{
      session: IAuthSession;
      user: IAuthSessionUser;
    } | null>;
  };
}

export interface ICreateBetterAuthInstanceOptions {
  orm: MikroORM;
}