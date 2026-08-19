import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { Request } from "express";

import { IS_PUBLIC_KEY } from "@/common/decorators/auth/public.decorator.constants";
import { EUserState } from "@/common/enums/users.enums";
import { AuthService } from "@/modules/auth/auth.service";
import { MembersRepository } from "@/modules/members/members.repository";
import { UserRolesService } from "@/modules/permissions/user-roles.service";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly membersRepository: MembersRepository,
    private readonly reflector: Reflector,
    private readonly userRolesService: UserRolesService,
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
        throw new UnauthorizedException("No valid session found");
      }

      if (session.user.state === EUserState.INACTIVE) {
        throw new ForbiddenException(
          "Your account has been deactivated. Please contact an administrator.",
        );
      }

      const enrichedSession = { ...session, session: { ...session.session } };
      if (session.session.activeOrganizationId && !session.session.activeOrganizationRole) {
        const member = await this.membersRepository.findByUserAndOrganization(
          session.user.id,
          session.session.activeOrganizationId,
        );
        if (member) {
          enrichedSession.session.activeOrganizationRole = member.role;
        }
      }

      const roles = await this.userRolesService.getUserRoles(
        session.user.id,
        session.session.activeOrganizationId,
      );

      const userWithRoles = { ...session.user, roles };

      (request as Request & { session: typeof enrichedSession }).session = enrichedSession;
      (request as Request & { user: typeof userWithRoles }).user = userWithRoles;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}
