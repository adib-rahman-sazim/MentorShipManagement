import type { INestApplication } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import type { MikroORM } from "@mikro-orm/postgresql";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy } from "vitest-mock-extended";

import { AI_MODEL_PROVIDER } from "@/modules/ai-sdk/ai-sdk.constants";
import { EMessagePartType, EMessageRole } from "@/modules/ai-sdk/ai-sdk.enums";
import type { IAiProvider } from "@/modules/ai-sdk/ai-sdk.interfaces";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { buildChatRequest } from "../utils/helpers/ai-sdk.helpers";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";

describe("AI SDK Example E2E", () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication["getHttpServer"]>;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let orm: MikroORM;
  let moduleFixture: TestingModule;
  let aiModelProvider: DeepMockProxy<IAiProvider>;

  beforeAll(async () => {
    const bootstrapped = await bootstrapTestServer();

    app = bootstrapped.appInstance;
    httpServer = bootstrapped.httpServerInstance;
    dbService = bootstrapped.dbServiceInstance;
    orm = bootstrapped.ormInstance;
    moduleFixture = bootstrapped.moduleFixture;
    aiModelProvider = moduleFixture.get(AI_MODEL_PROVIDER);
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();
  });

  describe("POST /ai-sdk/completion", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer)
        .post("/ai-sdk/completion")
        .send({ prompt: "The sky is" });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe("Invalid or expired session");
    });

    it("should return the generated completion text", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      aiModelProvider.generateCompletion.mockResolvedValue("blue and clear");

      const response = await request(httpServer)
        .post("/ai-sdk/completion")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ prompt: "The sky is" });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.text).toBe("blue and clear");
    });

    it("should accept optional id and data fields", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      aiModelProvider.generateCompletion.mockResolvedValue("result");

      const response = await request(httpServer)
        .post("/ai-sdk/completion")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ prompt: "Complete this", id: "req-001", data: { context: "test" } });

      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it("should return 400 when prompt is missing", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/completion")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when prompt is an empty string", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/completion")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ prompt: "" });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when prompt is not a string", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/completion")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ prompt: 42 });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should propagate errors thrown by the provider", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      aiModelProvider.generateCompletion.mockRejectedValue(new Error("LLM unavailable"));

      const response = await request(httpServer)
        .post("/ai-sdk/completion")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ prompt: "crash this" });

      expect(response.status).toBeGreaterThanOrEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe("POST /ai-sdk/chat", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer).post("/ai-sdk/chat").send(buildChatRequest());

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe("Invalid or expired session");
    });

    it("should return the assistant reply for a single user message", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      aiModelProvider.generateChat.mockResolvedValue("Hello! How can I help you?");

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send(buildChatRequest());

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.text).toBe("Hello! How can I help you?");
    });

    it("should handle a multi-turn conversation", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      aiModelProvider.generateChat.mockResolvedValue("Sure, here is the answer.");

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send(
          buildChatRequest({
            messages: [
              {
                id: "msg-1",
                role: EMessageRole.USER,
                parts: [{ type: EMessagePartType.TEXT, text: "What is 2+2?" }],
              },
              {
                id: "msg-2",
                role: EMessageRole.ASSISTANT,
                parts: [{ type: EMessagePartType.TEXT, text: "It is 4." }],
              },
              {
                id: "msg-3",
                role: EMessageRole.USER,
                parts: [{ type: EMessagePartType.TEXT, text: "Are you sure?" }],
              },
            ],
          }),
        );

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.text).toBe("Sure, here is the answer.");
    });

    it("should return 400 when messages field is missing", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when messages is not an array", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ messages: "not an array" });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when a message is missing the id field", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          messages: [
            {
              role: EMessageRole.USER,
              parts: [{ type: EMessagePartType.TEXT, text: "Hi" }],
            },
          ],
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when a message has an invalid role enum value", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          messages: [
            {
              id: "msg-1",
              role: "superuser",
              parts: [{ type: EMessagePartType.TEXT, text: "Hi" }],
            },
          ],
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when a message part has an invalid type enum value", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          messages: [
            {
              id: "msg-1",
              role: EMessageRole.USER,
              parts: [{ type: "unknown-type", text: "Hi" }],
            },
          ],
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when parts is not an array", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          messages: [
            {
              id: "msg-1",
              role: EMessageRole.USER,
              parts: "not an array",
            },
          ],
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should propagate errors thrown by the provider", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      aiModelProvider.generateChat.mockRejectedValue(new Error("LLM error"));

      const response = await request(httpServer)
        .post("/ai-sdk/chat")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send(buildChatRequest());

      expect(response.status).toBeGreaterThanOrEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe("POST /ai-sdk/chat/stream", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer)
        .post("/ai-sdk/chat/stream")
        .send(buildChatRequest());

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe("Invalid or expired session");
    });

    it("should stream a response and call pipeUIMessageStreamToResponse", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const pipeUIMessageStreamToResponse = vi.fn((res) => {
        res.status(200).end("streamed content");
      });

      aiModelProvider.streamChat.mockReturnValue(
        // @ts-expect-error - mocking stream response
        { pipeUIMessageStreamToResponse },
      );

      const response = await request(httpServer)
        .post("/ai-sdk/chat/stream")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send(buildChatRequest());

      expect(response.status).toBe(HttpStatus.OK);
      expect(pipeUIMessageStreamToResponse).toHaveBeenCalledOnce();
    });

    it("should return 400 when messages field is missing", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat/stream")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when a message has an invalid role enum value", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/ai-sdk/chat/stream")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          messages: [
            {
              id: "msg-1",
              role: "invalid-role",
              parts: [{ type: EMessagePartType.TEXT, text: "Hi" }],
            },
          ],
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should propagate errors thrown by the provider before streaming", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      aiModelProvider.streamChat.mockImplementation(() => {
        throw new Error("stream failed");
      });

      const response = await request(httpServer)
        .post("/ai-sdk/chat/stream")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send(buildChatRequest());

      expect(response.status).toBeGreaterThanOrEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
