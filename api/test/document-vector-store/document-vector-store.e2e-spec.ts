import type { INestApplication } from "@nestjs/common";
import { BadRequestException, HttpStatus } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import type { MikroORM } from "@mikro-orm/postgresql";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { DeepMockProxy } from "vitest-mock-extended";

import { DocumentVectorStoreService } from "@/modules/document-vector-store/document-vector-store.service";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";

describe("Document Vector Store E2E", () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication["getHttpServer"]>;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let orm: MikroORM;
  let moduleFixture: TestingModule;
  let documentVectorStoreService: DeepMockProxy<DocumentVectorStoreService>;

  beforeAll(async () => {
    const bootstrapped = await bootstrapTestServer();

    app = bootstrapped.appInstance;
    httpServer = bootstrapped.httpServerInstance;
    dbService = bootstrapped.dbServiceInstance;
    orm = bootstrapped.ormInstance;
    moduleFixture = bootstrapped.moduleFixture;
    documentVectorStoreService = moduleFixture.get(DocumentVectorStoreService);
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();
  });

  describe("POST /document-vector-store/upload", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer)
        .post("/document-vector-store/upload")
        .send({ fileKey: "some-key" });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe("Invalid or expired session");
    });

    it("should upload a document and return the file metadata", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.uploadDocument.mockResolvedValue({
        fileId: "file-abc123",
        vectorStoreId: "vs-xyz789",
        filename: "test.txt",
      });

      const response = await request(httpServer)
        .post("/document-vector-store/upload")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ fileKey: "uploads/test.txt" });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data).toMatchObject({
        fileId: "file-abc123",
        vectorStoreId: "vs-xyz789",
        filename: "test.txt",
      });
    });

    it("should upload a PDF file successfully", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.uploadDocument.mockResolvedValue({
        fileId: "file-pdf001",
        vectorStoreId: "vs-xyz789",
        filename: "document.pdf",
      });

      const response = await request(httpServer)
        .post("/document-vector-store/upload")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ fileKey: "uploads/document.pdf" });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data).toMatchObject({
        fileId: "file-pdf001",
        filename: "document.pdf",
      });
    });

    it("should return all required fields in the response", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.uploadDocument.mockResolvedValue({
        fileId: "file-shape-test",
        vectorStoreId: "vs-shape-test",
        filename: "shape.txt",
      });

      const response = await request(httpServer)
        .post("/document-vector-store/upload")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ fileKey: "uploads/shape.txt" });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(typeof response.body.data.fileId).toBe("string");
      expect(typeof response.body.data.vectorStoreId).toBe("string");
      expect(typeof response.body.data.filename).toBe("string");
    });

    it("should return 400 when the service throws a BadRequestException", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.uploadDocument.mockRejectedValue(
        new BadRequestException("Failed to upload document"),
      );

      const response = await request(httpServer)
        .post("/document-vector-store/upload")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ fileKey: "uploads/doc.pdf" });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe("Failed to upload document");
    });

    it("should return 400 when fileKey is missing", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/document-vector-store/upload")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("POST /document-vector-store/query", () => {
    it("should return 401 when no bearer token is provided", async () => {
      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .send({ query: "test query" });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe("Invalid or expired session");
    });

    it("should return matching documents for a valid query", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.queryDocuments.mockResolvedValue([
        {
          fileId: "file-001",
          filename: "report.txt",
          content: "This is a relevant document.",
          score: 0.92,
        },
      ]);

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "relevant document" });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0]).toMatchObject({
        fileId: "file-001",
        filename: "report.txt",
        content: "This is a relevant document.",
        score: 0.92,
      });
    });

    it("should pass maxResults to the service when provided", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.queryDocuments.mockResolvedValue([]);

      await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "test", maxResults: 3 });

      expect(documentVectorStoreService.queryDocuments).toHaveBeenCalledWith("test", 3);
    });

    it("should use the default maxResults of 5 when not provided", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.queryDocuments.mockResolvedValue([]);

      await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "test" });

      expect(documentVectorStoreService.queryDocuments).toHaveBeenCalledWith("test", 5);
    });

    it("should return an empty results array when no documents match", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.queryDocuments.mockResolvedValue([]);

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "no match" });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data.results).toEqual([]);
    });

    it("should return 400 when the query field is missing", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when query is not a string", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: 123 });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when maxResults is below the minimum (0)", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "test", maxResults: 0 });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when maxResults exceeds the maximum (21)", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "test", maxResults: 21 });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 when the service throws a BadRequestException", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.queryDocuments.mockRejectedValue(
        new BadRequestException("Failed to query documents"),
      );

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "crash" });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe("Failed to query documents");
    });

    it("should return the correct shape for each result item", async () => {
      await createUserInDb(dbService);
      const bearerToken = await getBearerToken(httpServer);

      documentVectorStoreService.queryDocuments.mockResolvedValue([
        { fileId: "f-1", filename: "a.txt", content: "text content", score: 0.85 },
        { fileId: "f-2", filename: "b.txt", content: "more content", score: 0.72 },
      ]);

      const response = await request(httpServer)
        .post("/document-vector-store/query")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ query: "shape test", maxResults: 2 });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data.results).toHaveLength(2);

      for (const item of response.body.data.results) {
        expect(typeof item.fileId).toBe("string");
        expect(typeof item.filename).toBe("string");
        expect(typeof item.content).toBe("string");
        expect(typeof item.score).toBe("number");
      }
    });
  });
});
