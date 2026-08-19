import type { NextFunction, Request, Response } from "express";

export function createBullBoardBasicAuthMiddleware(username: string, password: string) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      response.setHeader("WWW-Authenticate", 'Basic realm="Bull Board"');
      response.status(401).send("Authentication required");
      return;
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const colonIndex = credentials.indexOf(":");
    const providedUsername = credentials.slice(0, colonIndex);
    const providedPassword = credentials.slice(colonIndex + 1);

    if (providedUsername === username && providedPassword === password) {
      next();
      return;
    }

    response.setHeader("WWW-Authenticate", 'Basic realm="Bull Board"');
    response.status(401).send("Invalid credentials");
  };
}
