import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

import { EPermission } from "./permissions.enums";

/**
 * Better Auth organization plugin access control only.
 * App authorization uses CASL + DB catalog — do not use these for Nest/FE authz.
 */
export const STATEMENT = {
  ...defaultStatements,
  user: [EPermission.READ, EPermission.CREATE, EPermission.UPDATE, EPermission.DELETE],
  role: [EPermission.READ, EPermission.UPDATE],
} as const;

export const ac = createAccessControl(STATEMENT);

export const super_admin = ac.newRole({
  ...ownerAc.statements,
  user: [EPermission.READ, EPermission.CREATE, EPermission.UPDATE, EPermission.DELETE],
  role: [EPermission.READ, EPermission.UPDATE],
});

export const manager = ac.newRole({
  ...adminAc.statements,
  user: [EPermission.READ, EPermission.UPDATE],
  role: [EPermission.READ],
});

export const customer = ac.newRole({
  ...memberAc.statements,
  user: [EPermission.READ],
  invitation: [EPermission.CREATE, EPermission.CANCEL],
});
