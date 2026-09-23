import { SetMetadata } from "@nestjs/common";

import { PERMISSIONS_KEY } from "@/common/decorators/auth/permissions.decorator.constants";
import type { IPermissionsOptions } from "@/common/decorators/auth/permissions.decorator.interfaces";
import type { EPermissionCode } from "@/modules/permissions/permissions.enums";

export const Permissions = (
  permissions: EPermissionCode[],
  options?: Omit<IPermissionsOptions, "permissions">,
) => SetMetadata(PERMISSIONS_KEY, { permissions, ...options } satisfies IPermissionsOptions);
