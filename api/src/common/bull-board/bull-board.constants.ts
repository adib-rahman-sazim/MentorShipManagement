import { EStageEnv } from "@/common/enums/environment-variables.enums";

export const BULL_BOARD_BASE_PATH = "/admin/queues";

export const BULL_BOARD_ALLOWED_STAGE_ENVS = [
  EStageEnv.LOCAL,
  EStageEnv.DEVELOPMENT,
  EStageEnv.TEST,
];
