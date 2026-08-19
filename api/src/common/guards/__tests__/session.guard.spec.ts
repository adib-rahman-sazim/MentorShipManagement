import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

import { beforeEach, describe, expect, it } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import type { AuthService } from "@/modules/auth/auth.service";
import type { MembersRepository } from "@/modules/members/members.repository";
import type { UserRolesService } from "@/modules/permissions/user-roles.service";

import { SessionGuard } from "../session.guard";
import type { TSessionPayload } from "./session.guard.spec.types";

const buildSessionPayload = (overrides?: {
  user?: Partial<TSessionPayload["user"]>;
  session?: Partial<TSessionPayload["session"]>;
}): TSessionPayload => ({
  user: {
    id: "user-123",
    state: EUserState.ACTIVE,
    ...overrides?.user,
  },
  session: {
    id: "session-123",
    activeOrganizationId: null,
    ...overrides?.session,
  },
});

describe("SessionGuard", () => {
  let guard: SessionGuard;
  let mockAuthService: DeepMockProxy<AuthService>;
  let mockMembersRepository: DeepMockProxy<MembersRepository>;
  let mockReflector: DeepMockProxy<Reflector>;
  let mockUserRolesService: DeepMockProxy<UserRolesService>;
  let mockExecutionContext: DeepMockProxy<ExecutionContext>;
  let mockRequest: { headers: Record<string, string>; user?: unknown; session?: unknown };

  beforeEach(() => {
    mockAuthService = mockDeep<AuthService>();
    mockMembersRepository = mockDeep<MembersRepository>();
    mockReflector = mockDeep<Reflector>();
    mockUserRolesService = mockDeep<UserRolesService>();
    mockExecutionContext = mockDeep<ExecutionContext>();

    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockUserRolesService.getUserRoles.mockResolvedValue([EUserRole.SUPER_ADMIN]);

    mockRequest = {
      headers: {
        cookie: "test-session-cookie",
      },
    };

    mockExecutionContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    } as ReturnType<ExecutionContext["switchToHttp"]>);

    guard = new SessionGuard(
      mockAuthService,
      mockMembersRepository,
      mockReflector,
      mockUserRolesService,
    );
  });

  describe("canActivate", () => {
    it("should throw UnauthorizedException when no session is found", async () => {
      mockAuthService.auth.api.getSession.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when getSession throws an error", async () => {
      mockAuthService.auth.api.getSession.mockRejectedValue(new Error("Session error"));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw ForbiddenException when user state is INACTIVE", async () => {
      mockAuthService.auth.api.getSession.mockResolvedValue(
        buildSessionPayload({ user: { state: EUserState.INACTIVE } }) as never,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ForbiddenException);
    });

    it("should attach roles from UserRolesService on success", async () => {
      mockAuthService.auth.api.getSession.mockResolvedValue(buildSessionPayload() as never);

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
      expect(mockUserRolesService.getUserRoles).toHaveBeenCalledWith("user-123", null);
      expect((mockRequest.user as { roles?: EUserRole[] }).roles).toEqual([EUserRole.SUPER_ADMIN]);
    });
  });
});
