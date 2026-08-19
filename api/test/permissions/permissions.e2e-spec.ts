import type { INestApplication } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import type { MikroORM } from "@mikro-orm/postgresql";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { UserRole } from "@/common/entities/user-roles.entity";
import { EUserRole } from "@/common/enums/roles.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { ensureRole } from "../utils/helpers/user-roles.helpers";

describe("Permissions E2E (CASL)", () => {
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

  it("returns CASL rules for a super_admin without organization", async () => {
    const password = "Password123!";
    const user = await createUserInDb(dbService, {
      email: "superadmin@example.com",
      password,
    });

    const role = await ensureRole(dbService, EUserRole.SUPER_ADMIN, true);
    dbService.create(UserRole, {
      user,
      role,
      organization: null,
    });
    await dbService.flush();

    const token = await getBearerToken(httpServer, user.email, password);

    const response = await request(httpServer)
      .get("/permissions/my")
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(response.body.data.rules.length).toBeGreaterThan(0);
    expect(
      response.body.data.rules.some(
        (rule: { action: string[]; subject: string[] }) =>
          rule.action.includes("manage") && rule.subject.includes("all"),
      ),
    ).toBe(true);
  });
});
