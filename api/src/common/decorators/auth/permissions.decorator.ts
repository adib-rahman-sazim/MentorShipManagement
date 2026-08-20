import { SetMetadata } from "@nestjs/common";

import { PERMISSIONS_KEY } from "@/common/decorators/auth/permissions.decorator.constants";
import type { IPermissionsOptions } from "@/common/decorators/auth/permissions.decorator.interfaces";

export const Permissions = (permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions } satisfies IPermissionsOptions);
