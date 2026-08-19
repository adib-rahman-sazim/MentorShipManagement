import type { INestApplication } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import type { MikroORM } from "@mikro-orm/postgresql";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { Subscription } from "@/common/entities/subscriptions.entity";
import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";
import { PAYMENT_PROVIDER } from "@/modules/payments/payments.constants";
import type { IPaymentProvider } from "@/modules/payments/payments.interfaces";

import { createSubscriptionInDb } from "../payments/payments.helpers";
import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";

describe("Subscriptions E2E", () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication["getHttpServer"]>;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let moduleFixture: TestingModule;
  let orm: MikroORM;

  beforeAll(async () => {
    const {
      appInstance,
      httpServerInstance,
      dbServiceInstance,
      moduleFixture: testModuleFixture,
      ormInstance,
    } = await bootstrapTestServer();
    app = appInstance;
    httpServer = httpServerInstance;
    dbService = dbServiceInstance;
    moduleFixture = testModuleFixture;
    orm = ormInstance;
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();
  });

  describe("GET /subscriptions", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer).get("/subscriptions");

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it("should return empty list for user with no subscriptions", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .get("/subscriptions")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      const data = response.body.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it("should return user's subscriptions", async () => {
      const user = await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const subscription = createSubscriptionInDb(dbService, user);
      await dbService.persistAndFlush(subscription);

      const response = await request(httpServer)
        .get("/subscriptions")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      const data = response.body.data;
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBe(1);
      expect(data[0]).toMatchObject({
        id: subscription.id,
        priceId: subscription.priceId,
        status: ESubscriptionStatus.ACTIVE,
      });
    });

    it("should not return another user's subscriptions", async () => {
      const user = await createUserInDb(dbService);
      const otherUser = await createUserInDb(dbService, { email: "other@example.com" });
      const bearerToken = await getBearerToken(httpServer);

      const subscription = createSubscriptionInDb(dbService, user);
      const otherSubscription = createSubscriptionInDb(dbService, otherUser);
      await dbService.persistAndFlush([subscription, otherSubscription]);

      const response = await request(httpServer)
        .get("/subscriptions")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(subscription.id);
    });
  });

  describe("POST /subscriptions/:id/cancel", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer).post(
        "/subscriptions/550e8400-e29b-41d4-a716-446655440000/cancel",
      );

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it("should return 404 for non-existent subscription", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const validUuid = "550e8400-e29b-41d4-a716-446655440000";

      const response = await request(httpServer)
        .post(`/subscriptions/${validUuid}/cancel`)
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("should return 403 when user doesn't own subscription", async () => {
      await createUserInDb(dbService);
      const user2 = await createUserInDb(dbService, { email: "other@example.com" });

      const subscription = createSubscriptionInDb(dbService, user2);
      await dbService.persistAndFlush(subscription);

      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post(`/subscriptions/${subscription.id}/cancel`)
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(HttpStatus.NOT_FOUND).toBe(response.status);
    });

    it("should cancel subscription for authenticated user", async () => {
      const user = await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const subscription = createSubscriptionInDb(dbService, user);
      await dbService.persistAndFlush(subscription);

      const response = await request(httpServer)
        .post(`/subscriptions/${subscription.id}/cancel`)
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(HttpStatus.CREATED).toBe(response.status);
      const paymentProvider = moduleFixture.get<IPaymentProvider>(PAYMENT_PROVIDER);
      expect(paymentProvider.cancelSubscription).toHaveBeenCalledWith(
        subscription.providerSubscriptionId,
      );
      dbService.clear();
      const updatedSubscription = await dbService.findOneOrFail(Subscription, {
        id: subscription.id,
      });
      expect(updatedSubscription.cancelAtPeriodEnd).toBe(true);
      expect(updatedSubscription.status).toBe(ESubscriptionStatus.ACTIVE);
    });
  });

  describe("POST /subscriptions/:id/resume", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer).post(
        "/subscriptions/550e8400-e29b-41d4-a716-446655440000/resume",
      );

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it("should return 404 for non-existent subscription", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const validUuid = "550e8400-e29b-41d4-a716-446655440000";

      const response = await request(httpServer)
        .post(`/subscriptions/${validUuid}/resume`)
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("should return 403 when user doesn't own subscription", async () => {
      await createUserInDb(dbService);
      const user2 = await createUserInDb(dbService, { email: "other@example.com" });

      const subscription = createSubscriptionInDb(dbService, user2, {
        status: ESubscriptionStatus.CANCELLED,
        cancelAtPeriodEnd: true,
      });
      await dbService.persistAndFlush(subscription);

      const bearerToken = await getBearerToken(httpServer);
      const response = await request(httpServer)
        .post(`/subscriptions/${subscription.id}/resume`)
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("should resume subscription for authenticated user", async () => {
      const user = await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const subscription = createSubscriptionInDb(dbService, user, {
        status: ESubscriptionStatus.CANCELLED,
        cancelAtPeriodEnd: true,
      });
      await dbService.persistAndFlush(subscription);

      const response = await request(httpServer)
        .post(`/subscriptions/${subscription.id}/resume`)
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(HttpStatus.CREATED).toBe(response.status);
      const paymentProvider = moduleFixture.get<IPaymentProvider>(PAYMENT_PROVIDER);
      expect(paymentProvider.resumeSubscription).toHaveBeenCalledWith(
        subscription.providerSubscriptionId,
      );
      dbService.clear();
      const updatedSubscription = await dbService.findOneOrFail(Subscription, {
        id: subscription.id,
      });
      expect(updatedSubscription.cancelAtPeriodEnd).toBe(false);
      expect(updatedSubscription.status).toBe(ESubscriptionStatus.ACTIVE);
    });
  });
});
