import { afterEach, describe, expect, it } from "vitest";

import { EStageEnv } from "@/common/enums/environment-variables.enums";

import getWinstonLoggerTransports from "../logger";

describe("getWinstonLoggerTransports", () => {
  const originalStageEnv = process.env.STAGE_ENV;

  afterEach(() => {
    process.env.STAGE_ENV = originalStageEnv;
  });

  it("uses one JSON console transport in production", () => {
    process.env.STAGE_ENV = EStageEnv.PRODUCTION;

    const transports = getWinstonLoggerTransports();

    expect(transports).toHaveLength(1);
    expect(transports[0].constructor.name).toBe("Console");
  });

  it("uses readable console plus rotate files locally", () => {
    process.env.STAGE_ENV = EStageEnv.LOCAL;

    const transports = getWinstonLoggerTransports();

    expect(transports.map((transport) => transport.constructor.name)).toEqual([
      "DailyRotateFile",
      "DailyRotateFile",
      "Console",
    ]);
  });
});
