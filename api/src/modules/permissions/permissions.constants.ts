import type { FilterQuery } from "@mikro-orm/core";

import type { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";

export const NOT_SOFT_DELETED_OVERRIDE = {
  deletedAt: null,
} satisfies FilterQuery<UserPermissionOverride>;

export const PERMISSION_OVERRIDE_ERROR_MESSAGES = {
  ACTOR_NOT_SUPERADMIN: "Only the superadmin can manage per-user permission overrides",
  TARGET_USER_NOT_FOUND: "User not found",
  UNKNOWN_PERMISSION_CODE: "Unknown permission code",
  DUPLICATE_PERMISSION_CODE: "Each permission may appear at most once in an override list",
  SUPERADMIN_NOT_EDITABLE:
    "The superadmin's permissions cannot be changed. Every permission is already granted by their role, so an override would either do nothing or remove access that cannot be restored.",
} as const;

export const OVERRIDE_REASON_MAX_LENGTH = 500;
