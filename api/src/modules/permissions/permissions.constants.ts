import type { FilterQuery } from "@mikro-orm/core";

import type { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";

export const NOT_SOFT_DELETED_OVERRIDE = {
  deletedAt: null,
} satisfies FilterQuery<UserPermissionOverride>;
