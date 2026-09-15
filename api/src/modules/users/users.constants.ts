import type { FilterQuery } from "@mikro-orm/core";

import type { User } from "@/common/entities/users.entity";

export const USER_ERROR_MESSAGES = {
  USER_NOT_FOUND: "User not found",
  ROLE_NOT_FOUND: "Role not found",
  EMAIL_ALREADY_IN_USE: "A user with this email already exists",
  CANNOT_DELETE_SELF: "You cannot delete your own account",
  CANNOT_ASSIGN_SUPERADMIN: "Only a superadmin can assign the superadmin role",
  CANNOT_DEACTIVATE_SELF: "You cannot deactivate your own account",
} as const;

export const ROLE_FIELD = "role";
export const ROLE_CODE_FIELD = "code";

export const NOT_SOFT_DELETED = { deletedAt: null } satisfies FilterQuery<User>;

export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 128;
