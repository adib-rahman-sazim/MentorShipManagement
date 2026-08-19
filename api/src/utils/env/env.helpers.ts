import type { ConfigService } from "@nestjs/config";

export function readNumericEnv(
  configService: ConfigService,
  key: string,
  defaultValue: number,
): number {
  const raw = configService.get<string | number>(key);
  if (raw === undefined || raw === null || raw === "") {
    return defaultValue;
  }
  const parsed = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}
