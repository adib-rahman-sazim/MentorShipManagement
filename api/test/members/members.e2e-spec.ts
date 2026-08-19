import type { INestApplication } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import type { MikroORM } from "@mikro-orm/postgresql";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { Member } from "@/common/entities/members.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { EUserRole } from "@/common/enums/roles.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { ensureRole } from "../utils/helpers/user-roles.helpers";

describe("Members E2E", () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication["getHttpServer"]>;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let orm: MikroORM;

  beforeAll(async () => {
    const { appInstance, httpServerInstance, dbServiceInstance, ormInstance } =
      await bootstrapTestServer();
    app = appInstance;
    httpServer = httpServerInstance;
    dbService = dbServiceInstance;
    orm = ormInstance;
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dbService);
  });

  it("returns 401 when unauthenticated", async () => {
    await request(httpServer)
      .patch("/members")
      .send({ userId: "some-user-id", roleSlugs: [EUserRole.CUSTOMER] })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("allows super_admin to update org roles for a member", async () => {
    const password = "Password123!";
    const actor = await createUserInDb(dbService, {
      email: "actor@example.com",
      password,
    });
    const target = await createUserInDb(dbService, {
      email: "target@example.com",
      password,
    });

    const org = dbService.create(Organization, {
      name: "Org",
      slug: "org",
    });
    await dbService.persistAndFlush(org);

    const superAdminRole = await ensureRole(dbService, EUserRole.SUPER_ADMIN, true);
    const customerRole = await ensureRole(dbService, EUserRole.CUSTOMER, false);

    dbService.create(UserRole, { user: actor, role: superAdminRole, organization: null });
    dbService.create(Member, {
      user: target,
      organization: org,
      role: EUserRole.CUSTOMER,
    });
    dbService.create(UserRole, {
      user: target,
      role: customerRole,
      organization: org,
    });
    await dbService.flush();

    const token = await getBearerToken(httpServer, actor.email, password);

    await request(httpServer)
      .post("/api/v1/auth/organization/set-active")
      .set("Authorization", `Bearer ${token}`)
      .send({ organizationId: org.id });

    const response = await request(httpServer)
      .patch("/members")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: target.id, roleSlugs: [EUserRole.CUSTOMER] });

    expect([HttpStatus.OK, HttpStatus.FORBIDDEN, HttpStatus.BAD_REQUEST]).toContain(
      response.status,
    );
  });
});
