import { Injectable, NestMiddleware, RawBodyRequest } from "@nestjs/common";

import type { NextFunction, Request, Response } from "express";
import * as express from "express";

@Injectable()
export class RawBodyParserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    express.raw({ type: "application/json" })(req, res, (err) => {
      if (err) {
        next(err);
        return;
      }
      (req as RawBodyRequest<Request>).rawBody = req.body;
      next();
    });
  }
}
