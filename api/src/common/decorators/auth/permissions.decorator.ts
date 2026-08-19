import { SetMetadata } from "@nestjs/common";

import { PERMISSIONS_KEY } from "@/common/decorators/auth/permissions.decorator.constants";
import type { IPermissionsOptions } from "@/common/decorators/auth/permissions.decorator.interfaces";

export const Permissions = (
  permissions: string[],
  options?: { requireActiveOrganization?: boolean },
) =>
  SetMetadata(PERMISSIONS_KEY, {
    permissions,
    requireActiveOrganization: options?.requireActiveOrganization ?? false,
  } satisfies IPermissionsOptions);
