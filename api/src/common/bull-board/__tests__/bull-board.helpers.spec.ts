import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { createBullBoardBasicAuthMiddleware } from "../bull-board.helpers";

function createBasicAuthHeader(username = "admin", password = "secret"): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function createMockRequest(authorization?: string): Request {
  return {
    headers: {
      authorization,
    },
  } as Request;
}

function createMockResponse(): Response {
  return {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  } as unknown as Response;
}

function createMockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

describe("createBullBoardBasicAuthMiddleware", () => {
  it("returns 401 when credentials are missing", () => {
    const request = createMockRequest();
    const response = createMockResponse();
    const next = createMockNext();

    createBullBoardBasicAuthMiddleware("admin", "secret")(request, response, next);

    expect(response.setHeader).toHaveBeenCalledWith("WWW-Authenticate", 'Basic realm="Bull Board"');
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.send).toHaveBeenCalledWith("Authentication required");
    expect(next).not.toHaveBeenCalled();
  });

  it("continues when credentials match", () => {
    const request = createMockRequest(createBasicAuthHeader());
    const response = createMockResponse();
    const next = createMockNext();

    createBullBoardBasicAuthMiddleware("admin", "secret")(request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
  });
});
