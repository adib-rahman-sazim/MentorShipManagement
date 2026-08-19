import type { INestApplication } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import type { MikroORM } from "@mikro-orm/postgresql";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { Payment } from "@/common/entities/payments.entity";
import { Subscription } from "@/common/entities/subscriptions.entity";
import { EPaymentStatus, EPaymentType, EPaymentWebhookEvent } from "@/common/enums/payments.enums";
import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";
import { IPrice } from "@/modules/payments/payments.interfaces";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import {
  createMockCheckoutCompletedPayload,
  createMockCheckoutExpiredPayload,
  createMockOneOffCheckoutCompletedPayload,
  createMockPaymentSucceededPayload,
  createMockSubscriptionUpdatedPayload,
  createPaymentInDb,
  createSubscriptionInDb,
  TEST_CHECKOUT_URLS,
  TEST_ONE_TIME_PRICE_ID,
  TEST_PRO_PRICE_ID,
  TEST_RECURRING_PRICE_ID,
} from "./payments.helpers";

describe("Payments E2E", () => {
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
    dbService.clear();
  });

  describe("GET /payments/price-list", () => {
    it("should return price list without authentication", async () => {
      const response = await request(httpServer).get("/payments/price-list");

      expect(response.status).toBe(HttpStatus.OK);
      const data = response.body.data;
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBeGreaterThan(0);
    });

    it("should return prices with required properties", async () => {
      const response = await request(httpServer).get("/payments/price-list");

      expect(response.status).toBe(HttpStatus.OK);
      const data = response.body.data;
      expect(data).toBeInstanceOf(Array);
      data.forEach((price: IPrice) => {
        expect(price).toHaveProperty("id");
        expect(price).toHaveProperty("amount");
        expect(price).toHaveProperty("currency");
        expect(price).toHaveProperty("product");
        expect(price.product).toHaveProperty("id");
        expect(price.product).toHaveProperty("name");
      });
    });

    it("should include recurring information for subscription prices", async () => {
      const response = await request(httpServer).get("/payments/price-list");
      expect(response.status).toBe(HttpStatus.OK);
      const data = response.body.data;
      expect(data).toBeInstanceOf(Array);
      data.forEach((price: IPrice) => {
        if (price.recurring) {
          expect(price.recurring).toHaveProperty("interval");
          expect(price.recurring).toHaveProperty("intervalCount");
          expect(price.recurring).toHaveProperty("trialPeriodDays");
        }
      });
    });
  });

  describe("POST /payments/checkout-session", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .send({
          priceId: TEST_RECURRING_PRICE_ID,
          ...TEST_CHECKOUT_URLS,
        });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it("should create a checkout session for authenticated user", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: TEST_RECURRING_PRICE_ID,
          ...TEST_CHECKOUT_URLS,
        });

      expect(HttpStatus.CREATED).toBe(response.status);
      const data = response.body.data;
      expect(data).toHaveProperty("checkoutUrl");
      expect(data.checkoutUrl).toContain("checkout");
    });

    it("should create payment record with PENDING status", async () => {
      const user = await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: TEST_RECURRING_PRICE_ID,
          ...TEST_CHECKOUT_URLS,
        });

      expect(HttpStatus.CREATED).toBe(response.status);
      dbService.clear();
      const payment = await dbService.findOne(Payment, { user });
      expect(payment).toBeDefined();
      expect(payment?.status).toBe(EPaymentStatus.PENDING);
      expect(payment?.type).toBe(EPaymentType.RECURRING);
    });

    it("should support quantity for one-off payments", async () => {
      const user = await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);
      const quantity = 3;

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: TEST_ONE_TIME_PRICE_ID,
          quantity,
          ...TEST_CHECKOUT_URLS,
        });

      expect(HttpStatus.CREATED).toBe(response.status);
      const data = response.body.data;
      expect(data.checkoutUrl).toBeDefined();
      dbService.clear();
      const payment = await dbService.findOne(Payment, { user });
      expect(payment).toBeDefined();
      expect(payment?.status).toBe(EPaymentStatus.PENDING);
      expect(payment?.type).toBe(EPaymentType.ONE_OFF);
      expect(payment?.quantity).toBe(quantity);
    });

    it("should reject checkout when user already has an active subscription", async () => {
      const user = await createUserInDb(dbService);
      const subscription = createSubscriptionInDb(dbService, user, {
        priceId: TEST_PRO_PRICE_ID,
        status: ESubscriptionStatus.ACTIVE,
      });
      await dbService.persistAndFlush(subscription);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: TEST_RECURRING_PRICE_ID,
          ...TEST_CHECKOUT_URLS,
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should reject checkout when redirect URLs do not match the web client origin", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: TEST_RECURRING_PRICE_ID,
          successUrl: "https://example.com/success",
          cancelUrl: TEST_CHECKOUT_URLS.cancelUrl,
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should reject checkout when a subscription checkout is already pending", async () => {
      const user = await createUserInDb(dbService);
      const payment = createPaymentInDb(dbService, user, {
        priceId: TEST_PRO_PRICE_ID,
        status: EPaymentStatus.PENDING,
        type: EPaymentType.RECURRING,
      });
      await dbService.persistAndFlush(payment);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: TEST_RECURRING_PRICE_ID,
          ...TEST_CHECKOUT_URLS,
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 for invalid price ID", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: "invalid_price_id_that_does_not_exist",
          ...TEST_CHECKOUT_URLS,
        });

      expect(HttpStatus.BAD_REQUEST).toBe(response.status);
    });

    it("should return 400 when required fields are missing", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/payments/checkout-session")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          priceId: TEST_RECURRING_PRICE_ID,
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("GET /payments", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer).get("/payments");

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it("should return empty list for user with no payments", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .get("/payments")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      const data = response.body.data;
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBe(0);
    });

    it("should return user's payments in descending order", async () => {
      const user = await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const payment1 = createPaymentInDb(dbService, user, {
        type: EPaymentType.RECURRING,
        status: EPaymentStatus.SUCCEEDED,
        description: "First payment",
      });
      await dbService.persistAndFlush(payment1);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const payment2 = createPaymentInDb(dbService, user, {
        type: EPaymentType.ONE_OFF,
        status: EPaymentStatus.PENDING,
        quantity: 2,
        description: "Second payment",
      });
      await dbService.persistAndFlush(payment2);

      const response = await request(httpServer)
        .get("/payments")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      const data = response.body.data;
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBe(2);
      expect(data[0].id).toBe(payment2.id);
      expect(data[1].id).toBe(payment1.id);
    });

    it("should return paginated payment history", async () => {
      const user = await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const payment1 = createPaymentInDb(dbService, user, {
        description: "First payment",
      });
      await dbService.persistAndFlush(payment1);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const payment2 = createPaymentInDb(dbService, user, {
        description: "Second payment",
      });
      await dbService.persistAndFlush(payment2);

      const response = await request(httpServer)
        .get("/payments")
        .query({ page: 2, limit: 1 })
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(payment1.id);
      expect(response.body.meta).toEqual({
        currentPage: 2,
        itemsPerPage: 1,
        totalItems: 2,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it("should not return another user's payments", async () => {
      const user = await createUserInDb(dbService);
      const otherUser = await createUserInDb(dbService, { email: "other@example.com" });
      const bearerToken = await getBearerToken(httpServer);

      const payment = createPaymentInDb(dbService, user);
      const otherPayment = createPaymentInDb(dbService, otherUser);
      await dbService.persistAndFlush([payment, otherPayment]);

      const response = await request(httpServer)
        .get("/payments")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(payment.id);
    });
  });

  describe("POST /payments/webhook", () => {
    it("should accept webhook without authentication", async () => {
      const response = await request(httpServer)
        .post("/payments/webhook")
        .send(createMockCheckoutCompletedPayload());

      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.CREATED]).toContain(
        response.status,
      );
    });

    describe("Webhook: Checkout Completed", () => {
      it("should update payment status to SUCCEEDED and create subscription", async () => {
        const user = await createUserInDb(dbService);

        const payment = createPaymentInDb(dbService, user, {
          externalId: "session_001",
          type: EPaymentType.RECURRING,
          status: EPaymentStatus.PENDING,
          amount: 0,
        });
        await dbService.persistAndFlush(payment);

        const payload = createMockCheckoutCompletedPayload({
          sessionId: payment.externalId,
        });

        const response = await request(httpServer).post("/payments/webhook").send(payload);

        expect(HttpStatus.CREATED).toBe(response.status);

        dbService.clear();
        const updatedPayment = await dbService.findOne(Payment, { id: payment.id });
        expect(updatedPayment?.status).toBe(EPaymentStatus.SUCCEEDED);
        expect(updatedPayment?.amount).toBeGreaterThan(0);
        const subscription = await dbService.findOne(Subscription, { user });
        expect(subscription).toBeDefined();
        expect(subscription?.status).toBe(ESubscriptionStatus.ACTIVE);
        expect(subscription?.priceId).toBe(TEST_RECURRING_PRICE_ID);
      });

      it("should reuse an existing subscription when checkout completed webhook is retried", async () => {
        const user = await createUserInDb(dbService);
        const subscription = createSubscriptionInDb(dbService, user, {
          providerSubscriptionId: "sub_retry",
        });
        const payment = createPaymentInDb(dbService, user, {
          externalId: "session_retry",
          type: EPaymentType.RECURRING,
          status: EPaymentStatus.PENDING,
          amount: 0,
        });
        await dbService.persistAndFlush([subscription, payment]);

        const payload = createMockCheckoutCompletedPayload({
          sessionId: payment.externalId,
          subscriptionId: subscription.providerSubscriptionId,
        });

        const response = await request(httpServer).post("/payments/webhook").send(payload);

        expect(HttpStatus.CREATED).toBe(response.status);
        dbService.clear();
        const subscriptions = await dbService.find(Subscription, {
          providerSubscriptionId: subscription.providerSubscriptionId,
        });
        expect(subscriptions).toHaveLength(1);
        const updatedPayment = await dbService.findOneOrFail(Payment, { id: payment.id });
        expect(updatedPayment.subscription?.id).toBe(subscription.id);
      });

      it("should complete one-off checkout without creating a subscription", async () => {
        const user = await createUserInDb(dbService);
        const payment = createPaymentInDb(dbService, user, {
          externalId: "session_one_off",
          type: EPaymentType.ONE_OFF,
          status: EPaymentStatus.PENDING,
          amount: 0,
          subscription: null,
        });
        await dbService.persistAndFlush(payment);

        const response = await request(httpServer)
          .post("/payments/webhook")
          .send(createMockOneOffCheckoutCompletedPayload({ sessionId: payment.externalId }));

        expect(response.status).toBe(HttpStatus.CREATED);
        dbService.clear();
        const updatedPayment = await dbService.findOneOrFail(Payment, { id: payment.id });
        expect(updatedPayment.status).toBe(EPaymentStatus.SUCCEEDED);
        expect(updatedPayment.amount).toBeGreaterThan(0);
        expect(updatedPayment.subscription ?? null).toBeNull();
        const subscriptions = await dbService.find(Subscription, { user });
        expect(subscriptions).toHaveLength(0);
      });

      it("should create renewal payment for subscription cycle invoices", async () => {
        const user = await createUserInDb(dbService);
        const subscription = createSubscriptionInDb(dbService, user);
        await dbService.persistAndFlush(subscription);

        const payload = createMockPaymentSucceededPayload({
          subscriptionId: subscription.providerSubscriptionId,
        });

        const response = await request(httpServer).post("/payments/webhook").send(payload);

        expect(HttpStatus.CREATED).toBe(response.status);
        dbService.clear();
        const payment = await dbService.findOneOrFail(Payment, {
          externalId: payload.data.invoiceId,
        });
        expect(payment.status).toBe(EPaymentStatus.SUCCEEDED);
        expect(payment.subscription?.id).toBe(subscription.id);
      });

      it("should not create duplicate renewal payments for the same invoice", async () => {
        const user = await createUserInDb(dbService);
        const subscription = createSubscriptionInDb(dbService, user);
        await dbService.persistAndFlush(subscription);

        const payload = createMockPaymentSucceededPayload({
          subscriptionId: subscription.providerSubscriptionId,
        });

        const firstResponse = await request(httpServer).post("/payments/webhook").send(payload);
        const secondResponse = await request(httpServer).post("/payments/webhook").send(payload);

        expect(firstResponse.status).toBe(HttpStatus.CREATED);
        expect(secondResponse.status).toBe(HttpStatus.CREATED);
        dbService.clear();
        const payments = await dbService.find(Payment, {
          externalId: payload.data.invoiceId,
        });
        expect(payments).toHaveLength(1);
      });

      it("should handle concurrent duplicate renewal webhooks idempotently", async () => {
        const user = await createUserInDb(dbService);
        const subscription = createSubscriptionInDb(dbService, user);
        await dbService.persistAndFlush(subscription);

        const payload = createMockPaymentSucceededPayload({
          subscriptionId: subscription.providerSubscriptionId,
        });

        const [firstResponse, secondResponse] = await Promise.all([
          request(httpServer).post("/payments/webhook").send(payload),
          request(httpServer).post("/payments/webhook").send(payload),
        ]);

        expect(firstResponse.status).toBe(HttpStatus.CREATED);
        expect(secondResponse.status).toBe(HttpStatus.CREATED);
        dbService.clear();
        const payments = await dbService.find(Payment, {
          externalId: payload.data.invoiceId,
        });
        expect(payments).toHaveLength(1);
      });

      it("should update subscription status from subscription webhook events", async () => {
        const user = await createUserInDb(dbService);
        const subscription = createSubscriptionInDb(dbService, user);
        await dbService.persistAndFlush(subscription);

        const payload = createMockSubscriptionUpdatedPayload({
          subscriptionId: subscription.providerSubscriptionId,
          status: ESubscriptionStatus.PAST_DUE,
        });

        const response = await request(httpServer).post("/payments/webhook").send(payload);

        expect(HttpStatus.CREATED).toBe(response.status);
        dbService.clear();
        const updatedSubscription = await dbService.findOneOrFail(Subscription, {
          id: subscription.id,
        });
        expect(updatedSubscription.status).toBe(ESubscriptionStatus.PAST_DUE);
      });

      it("should mark pending payment as failed when checkout expires", async () => {
        const user = await createUserInDb(dbService);
        const payment = createPaymentInDb(dbService, user, {
          externalId: "expired_session",
          status: EPaymentStatus.PENDING,
        });
        await dbService.persistAndFlush(payment);

        const response = await request(httpServer)
          .post("/payments/webhook")
          .send(createMockCheckoutExpiredPayload({ sessionId: payment.externalId }));

        expect(HttpStatus.CREATED).toBe(response.status);
        dbService.clear();
        const updatedPayment = await dbService.findOneOrFail(Payment, { id: payment.id });
        expect(updatedPayment.status).toBe(EPaymentStatus.FAILED);
      });

      it("should return 400 when webhook processing fails", async () => {
        const response = await request(httpServer)
          .post("/payments/webhook")
          .send({
            event: EPaymentWebhookEvent.CHECKOUT_COMPLETED,
            data: {
              sessionId: "missing_session",
            },
          });

        expect(HttpStatus.BAD_REQUEST).toBe(response.status);
      });
    });
  });
});
