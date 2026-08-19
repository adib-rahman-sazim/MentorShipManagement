import type { INestApplication } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";

import type { EntityManager, MikroORM } from "@mikro-orm/postgresql";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { Member } from "@/common/entities/members.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { AuthInvitationProcessor } from "@/modules/auth/auth-invitation.processor";
import { ORGANIZATION_ERROR_MESSAGES } from "@/modules/organizations/organizations.constants";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { assignUserRole, ensureRole } from "../utils/helpers/user-roles.helpers";

describe("Organizations E2E - self-serve onboarding", () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication["getHttpServer"]>;
  let dbService: EntityManager;
  let orm: MikroORM;
  const authInvitationProcessor = new AuthInvitationProcessor();

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

  it("finalizes open signup as provisional customer + NOT_ONBOARDED", async () => {
    const user = await createUserInDb(dbService, {
      email: "founder@example.com",
      state: EUserState.ACTIVE,
    });
    await ensureRole(dbService, EUserRole.CUSTOMER, false);

    await authInvitationProcessor.finalizeUserSignup(dbService, {
      userId: user.id,
      targetRole: EUserRole.CUSTOMER,
      invitation: null,
      organizationId: null,
    });

    await dbService.refresh(user);

    expect(user.state).toBe(EUserState.NOT_ONBOARDED);

    const provisional = await dbService.findOne(
      UserRole,
      {
        user: { id: user.id },
        organization: null,
        role: { slug: EUserRole.CUSTOMER },
      },
      { populate: ["role"] },
    );
    expect(provisional).not.toBeNull();
    expect(provisional?.role.slug).toBe(EUserRole.CUSTOMER);
  });

  it("allows NOT_ONBOARDED customer to create organization and become ACTIVE", async () => {
    const password = "Password123!";
    const user = await createUserInDb(dbService, {
      email: "founder@example.com",
      password,
      state: EUserState.NOT_ONBOARDED,
    });
    await assignUserRole(dbService, user, EUserRole.CUSTOMER, null);

    const token = await getBearerToken(httpServer, user.email, password);

    const response = await request(httpServer)
      .post("/organizations")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Acme Corp", slug: "acme-corp" })
      .expect(HttpStatus.CREATED);

    expect(response.body.data).toMatchObject({
      name: "Acme Corp",
      slug: "acme-corp",
    });

    await dbService.refresh(user);
    expect(user.state).toBe(EUserState.ACTIVE);
    expect(user.firstLoginAt).toBeTruthy();

    const member = await dbService.findOne(Member, {
      user: { id: user.id },
      organization: { slug: "acme-corp" },
    });
    expect(member).not.toBeNull();
    expect(member?.role).toBe(EUserRole.CUSTOMER);

    const provisional = await dbService.findOne(UserRole, {
      user: { id: user.id },
      organization: null,
      role: { slug: EUserRole.CUSTOMER },
    });
    expect(provisional).toBeNull();

    const orgBound = await dbService.findOne(UserRole, {
      user: { id: user.id },
      organization: { id: response.body.data.id },
      role: { slug: EUserRole.CUSTOMER },
    });
    expect(orgBound).not.toBeNull();
  });

  it("rejects already onboarded ACTIVE customer", async () => {
    const password = "Password123!";
    const user = await createUserInDb(dbService, {
      email: "active@example.com",
      password,
      state: EUserState.ACTIVE,
    });
    const org = dbService.create(Organization, {
      name: "Existing",
      slug: "existing",
      createdBy: user,
    });
    await dbService.persistAndFlush(org);
    dbService.create(Member, {
      user,
      organization: org,
      role: EUserRole.CUSTOMER,
    });
    await assignUserRole(dbService, user, EUserRole.CUSTOMER, org.id);

    const token = await getBearerToken(httpServer, user.email, password);

    await request(httpServer)
      .post("/api/v1/auth/organization/set-active")
      .set("Authorization", `Bearer ${token}`)
      .send({ organizationId: org.id });

    const response = await request(httpServer)
      .post("/organizations")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Another Org", slug: "another-org" })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe(ORGANIZATION_ERROR_MESSAGES.USER_ALREADY_ONBOARDED);
  });

  it("rejects manager creating organization", async () => {
    const password = "Password123!";
    const user = await createUserInDb(dbService, {
      email: "manager@example.com",
      password,
    });
    await assignUserRole(dbService, user, EUserRole.MANAGER, null);

    const token = await getBearerToken(httpServer, user.email, password);

    await request(httpServer)
      .post("/organizations")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nope", slug: "nope" })
      .expect(HttpStatus.FORBIDDEN);
  });

  it("allows super_admin to create organization without membership", async () => {
    const password = "Password123!";
    const user = await createUserInDb(dbService, {
      email: "admin@example.com",
      password,
    });
    await assignUserRole(dbService, user, EUserRole.SUPER_ADMIN, null);

    const token = await getBearerToken(httpServer, user.email, password);

    const response = await request(httpServer)
      .post("/organizations")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ops Org", slug: "ops-org" })
      .expect(HttpStatus.CREATED);

    const member = await dbService.findOne(Member, {
      user: { id: user.id },
      organization: { id: response.body.data.id },
    });
    expect(member).toBeNull();
  });

  it("rejects duplicate slug", async () => {
    const password = "Password123!";
    const existingOwner = await createUserInDb(dbService, {
      email: "owner@example.com",
      password,
    });
    dbService.create(Organization, {
      name: "Taken",
      slug: "taken-slug",
      createdBy: existingOwner,
    });
    await dbService.flush();

    const founder = await createUserInDb(dbService, {
      email: "founder2@example.com",
      password,
      state: EUserState.NOT_ONBOARDED,
    });
    await assignUserRole(dbService, founder, EUserRole.CUSTOMER, null);

    const token = await getBearerToken(httpServer, founder.email, password);

    const response = await request(httpServer)
      .post("/organizations")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name", slug: "taken-slug" })
      .expect(HttpStatus.CONFLICT);

    expect(response.body.message).toBe(ORGANIZATION_ERROR_MESSAGES.SLUG_ALREADY_EXISTS);
  });

  it("exposes provisional customer permissions without active organization", async () => {
    const password = "Password123!";
    const user = await createUserInDb(dbService, {
      email: "provisional@example.com",
      password,
      state: EUserState.NOT_ONBOARDED,
    });
    await assignUserRole(dbService, user, EUserRole.CUSTOMER, null);

    const token = await getBearerToken(httpServer, user.email, password);

    const response = await request(httpServer)
      .get("/permissions/my")
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(
      response.body.data.rules.some(
        (rule: { action: string | string[]; subject: string | string[] }) => {
          const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
          const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
          return actions.includes("create") && subjects.includes("organization");
        },
      ),
    ).toBe(true);
  });
});
