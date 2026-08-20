import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { RedisService } from "@/modules/redis/redis.service";
import { readNumericEnv } from "@/utils/env/env.helpers";

import type { TAppRawRule } from "./casl.types";
import {
  CASL_CACHE_KEY_PREFIX,
  CASL_CACHE_TTL_SECONDS_DEFAULT,
  CASL_CACHE_TTL_SECONDS_ENV,
} from "./casl-cache.constants";

@Injectable()
export class CaslCacheService {
  private readonly logger = new Logger(CaslCacheService.name);
  private readonly ttlSeconds: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.ttlSeconds = readNumericEnv(
      this.configService,
      CASL_CACHE_TTL_SECONDS_ENV,
      CASL_CACHE_TTL_SECONDS_DEFAULT,
    );
  }

  buildUserCacheKey(userId: string): string {
    return `${CASL_CACHE_KEY_PREFIX}user:${userId}`;
  }

  async getRules(key: string): Promise<TAppRawRule[] | null> {
    try {
      const rawCaslRules = await this.redisService.get(key);
      if (!rawCaslRules) {
        return null;
      }
      return JSON.parse(rawCaslRules) as TAppRawRule[];
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to read CASL cache for key ${key}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
      return null;
    }
  }

  async setRules(key: string, rules: TAppRawRule[]): Promise<void> {
    try {
      await this.redisService.set(key, JSON.stringify(rules), this.ttlSeconds);
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to write CASL cache for key ${key}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }

  async invalidateUser(userId: string): Promise<void> {
    try {
      const pattern = `${CASL_CACHE_KEY_PREFIX}user:${userId}*`;
      const keys = await this.redisService.scanKeys(pattern);
      if (keys.length === 0) {
        return;
      }
      await this.redisService.del(...keys);
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to invalidate CASL cache for user ${userId}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }

  async invalidateUsers(userIds: string[]): Promise<void> {
    const uniqueUserIds = Array.from(new Set(userIds));
    for (const userId of uniqueUserIds) {
      await this.invalidateUser(userId);
    }
  }
}
