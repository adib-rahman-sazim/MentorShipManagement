import { Injectable } from "@nestjs/common";

import { AUTH_ERROR_MESSAGES } from "./auth.constants";
import type { IBetterAuthInstance } from "./auth.interfaces";

@Injectable()
export class AuthService {
  private authInstance: IBetterAuthInstance | null = null;

  setAuth(auth: IBetterAuthInstance) {
    this.authInstance = auth;
  }

  get auth(): IBetterAuthInstance {
    if (!this.authInstance) {
      throw new Error(AUTH_ERROR_MESSAGES.AUTH_NOT_INITIALIZED);
    }
    return this.authInstance;
  }
}
