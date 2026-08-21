import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { Request } from "express";

import { IS_PUBLIC_KEY } from "@/common/decorators/auth/public.decorator.constants";
import { EUserState } from "@/common/enums/users.enums";
import { AuthService } from "@/modules/auth/auth.service";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/auth.constants";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    try {
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value[0] : value);
        }
      });

      const session = await this.authService.auth.api.getSession({
        headers,
      });

     if (!session) {
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.NO_VALID_SESSION);
      }

      if (session.user.deletedAt) {
        throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
      }

      if (session.user.state === EUserState.INACTIVE) {
        throw new ForbiddenException(AUTH_ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
      }


      request.session = session as unknown as Request["session"];
      request.user = session.user as unknown as Express.IUser;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
           throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_OR_EXPIRED_SESSION);;
    }
  }
}
