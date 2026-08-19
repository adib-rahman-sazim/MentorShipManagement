import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

import {
  ALLOWED_HEADERS,
  ALLOWED_METHODS,
  DEVELOPMENT_ALLOWED_URLS_WILDCARDS,
  EXPOSED_HEADERS,
  LOCAL_ALLOWED_URLS_WILDCARDS,
  PRODUCTION_ALLOWED_URLS_WILDCARDS,
} from "@/common/config/cors.constants";
import { EStageEnv } from "@/common/enums/environment-variables.enums";

export function getCorsConfig(): CorsOptions {
  return {
    origin: getAllowedOrigins(),
    allowedHeaders: getAllowedHeaders(),
    exposedHeaders: EXPOSED_HEADERS,
  };
}

export function getAllowedOrigins(): (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => void {
  const allowedOriginWildcards = getAllowedOriginWildcards();

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    for (const allowedOriginWildcard of allowedOriginWildcards) {
      const regexPattern = new RegExp("^" + allowedOriginWildcard.replace(/\*/g, ".*") + "$");
      if (regexPattern.test(origin)) {
        callback(null, true);
        return;
      }
    }
    callback(null, false);
  };
}

export function getAllowedOriginWildcards(): string[] {
  const stageEnv = process.env.STAGE_ENV as EStageEnv;

  switch (stageEnv) {
    case EStageEnv.LOCAL:
      return LOCAL_ALLOWED_URLS_WILDCARDS;

    case EStageEnv.DEVELOPMENT:
      return DEVELOPMENT_ALLOWED_URLS_WILDCARDS;

    case EStageEnv.PRODUCTION:
      return PRODUCTION_ALLOWED_URLS_WILDCARDS;

    default:
      return [];
  }
}

export function getAllowedHeaders(): string[] {
  return ALLOWED_HEADERS;
}

export function getAllowedMethods(): string {
  return ALLOWED_METHODS.join(",");
}
