import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

import { beforeEach, describe, expect, it } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import type { AuthService } from "@/modules/auth/auth.service";

import { SessionGuard } from "../session.guard";
import type { TSessionPayload } from "./session.guard.spec.types";

const buildSessionPayload = (overrides?: {
  user?: Partial<TSessionPayload["user"]>;
  session?: Partial<TSessionPayload["session"]>;
}): TSessionPayload => ({
  user: {
    id: "user-123",
    state: EUserState.ACTIVE,
    role: EUserRole.SENSEI,
    ...overrides?.user,
  },
  session: {
    id: "session-123",
    ...overrides?.session,
  },
});

describe("SessionGuard", () => {
  let guard: SessionGuard;
  let mockAuthService: DeepMockProxy<AuthService>;
  let mockReflector: DeepMockProxy<Reflector>;
  let mockExecutionContext: DeepMockProxy<ExecutionContext>;
  let mockRequest: { headers: Record<string, string>; user?: unknown; session?: unknown };

  beforeEach(() => {
    mockAuthService = mockDeep<AuthService>();
    mockReflector = mockDeep<Reflector>();
    mockExecutionContext = mockDeep<ExecutionContext>();

    mockReflector.getAllAndOverride.mockReturnValue(false);

    mockRequest = {
      headers: {
        cookie: "test-session-cookie",
      },
    };

    mockExecutionContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    } as ReturnType<ExecutionContext["switchToHttp"]>);

    guard = new SessionGuard(mockAuthService, mockReflector);
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

    it("should throw ForbiddenException when the user is soft deleted", async () => {
      mockAuthService.auth.api.getSession.mockResolvedValue(
        buildSessionPayload({ user: { deletedAt: new Date() } }) as never,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ForbiddenException);
    });

    it("should throw UnauthorizedException when the session carries no role", async () => {
      mockAuthService.auth.api.getSession.mockResolvedValue(
        buildSessionPayload({ user: { role: undefined } }) as never,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it("should attach the session user to the request on success", async () => {
      mockAuthService.auth.api.getSession.mockResolvedValue(buildSessionPayload() as never);

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
      expect((mockRequest.user as { id: string }).id).toBe("user-123");
    });

    it("should attach the role to the request user so downstream ABAC can read it", async () => {
      mockAuthService.auth.api.getSession.mockResolvedValue(
        buildSessionPayload({ user: { role: EUserRole.MENTOR } }) as never,
      );

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
      expect((mockRequest.user as { role: EUserRole }).role).toBe(EUserRole.MENTOR);
    });
  });
});
