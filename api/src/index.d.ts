import type { IEnvironmentVariables } from "./common/interfaces/environment-variables.interfaces";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IEnvironmentVariables {
      NODE_ENV: "development" | "production" | "test" | "local";
    }
  }
}
