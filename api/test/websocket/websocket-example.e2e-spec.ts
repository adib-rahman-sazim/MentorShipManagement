import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

import {
  EGatewayIncomingEvent,
  EGatewayOutgoingEvent,
} from "@/modules/websocket-example/websocket-example.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { MOCK_USER_EMAIL, MOCK_USER_PASSWORD } from "../utils/helpers/create-user-in-db.constants";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../utils/http-server.types";

describe("Websocket Example Gateway (E2E)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;
  let socket: Socket;

  let bearerToken: string;

  const defaultSocketConnectConfig = {
    autoConnect: false,
    path: "/ws-example",
    transports: ["websocket"],
  };
  const defaultSocketUrl = `ws://localhost:${process.env.BE_WS_PORT}`;

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer();
    app = appInstance;
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    orm = ormInstance;

    await truncateTables(dbService);
    dbService.clear();

    await createUserInDb(dbService);

    bearerToken = await getBearerToken(httpServer, MOCK_USER_EMAIL, MOCK_USER_PASSWORD);
  });

  afterAll(async () => {
    await truncateTables(dbService);
    await orm.close();
    await httpServer.close();
    await app.close();
  });

  afterEach(() => {
    dbService.clear();
    if (socket) {
      socket.disconnect();
    }
  });

  describe("unauthenticated user", () => {
    it("unauthenticated users cannot connect", async () => {
      await new Promise<void>((resolve, reject) => {
        socket = io(defaultSocketUrl, {
          ...defaultSocketConnectConfig,
          auth: {
            token: "invalid-token",
          },
          extraHeaders: {
            authorization: "Bearer invalid-token",
          },
        });

        socket.on("connect_error", (error) => {
          try {
            expect(error.message).toBe("Unauthorized");
            resolve();
          } catch (assertionError) {
            reject(assertionError);
          }
        });

        socket.connect();
      });
    });
  });

  describe("authenticated user", () => {
    it("authenticated users can connect", async () => {
      await new Promise<void>((resolve, reject) => {
        socket = io(defaultSocketUrl, {
          ...defaultSocketConnectConfig,
          auth: {
            token: bearerToken,
          },
          extraHeaders: {
            authorization: `Bearer ${bearerToken}`,
          },
        });

        socket.on("connect", () => {
          try {
            expect(socket.connected).toBe(true);
            resolve();
          } catch (assertionError) {
            reject(assertionError);
          }
        });

        socket.connect();
      });
    });
  });

  describe("ping event", () => {
    it("responds to ping event", async () => {
      await new Promise<void>((resolve, reject) => {
        socket = io(defaultSocketUrl, {
          ...defaultSocketConnectConfig,
          auth: {
            token: bearerToken,
          },
          extraHeaders: {
            authorization: `Bearer ${bearerToken}`,
          },
        });

        socket.on("connect", () => {
          socket.emit(EGatewayIncomingEvent.PING, { data: "ping" });
          socket.on(EGatewayOutgoingEvent.PONG, (payload: { data: string }) => {
            try {
              expect(payload).toEqual({ data: "ping" });
              resolve();
            } catch (assertionError) {
              reject(assertionError);
            }
          });
        });

        socket.connect();
      });
    });
  });
});
