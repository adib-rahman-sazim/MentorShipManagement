import type { EBackoffType } from "./queue.enums";

export interface IBuildDefaultJobOptionsOverrides {
  attemptsEnv?: string;
  attemptsDefault?: string;
  delayEnv?: string;
  delayDefault?: string;
  backoffType?: EBackoffType;
}
