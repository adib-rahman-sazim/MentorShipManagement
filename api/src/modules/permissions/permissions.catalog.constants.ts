import { EUserRole } from "@/common/enums/roles.enums";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import { permissionCodesFromPairs, toPermissionDefinition } from "./permissions.catalog.helpers";
import { EPermission, EResource } from "./permissions.enums";
import type { IPermissionDefinition } from "./permissions.interfaces";

const DOMAIN_RESOURCES = [EResource.USER, EResource.ROLE, EResource.PERMISSIONS] as const;

const DOMAIN_ACTIONS = [
  EPermission.LIST,
  EPermission.READ,
  EPermission.CREATE,
  EPermission.UPDATE,
  EPermission.DELETE,
] as const;

const PAGE_RESOURCES = [EResource.DASHBOARD, EResource.SETTINGS, EResource.USER] as const;

export const DEFAULT_PERMISSION_DEFINITIONS: IPermissionDefinition[] = [
  toPermissionDefinition(EResource.ALL, EPermission.MANAGE, "Full platform manage"),
  ...DOMAIN_RESOURCES.flatMap((resource) =>
    DOMAIN_ACTIONS.map((action) => toPermissionDefinition(resource, action)),
  ),
  ...PAGE_RESOURCES.map((resource) =>
    toPermissionDefinition(resource, EPermission.PAGE_VIEW, `View ${resource} page`),
  ),
];

const ALL_PAGE_VIEWS = PAGE_RESOURCES.map((resource) =>
  createPermission(resource, EPermission.PAGE_VIEW),
);

const SENSEI_PAGE_VIEWS = [EResource.DASHBOARD, EResource.SETTINGS, EResource.USER].map(
  (resource) => createPermission(resource, EPermission.PAGE_VIEW),
);

const MENTOR_PAGE_VIEWS = [EResource.DASHBOARD, EResource.SETTINGS, EResource.USER].map(
  (resource) => createPermission(resource, EPermission.PAGE_VIEW),
);

const MENTEE_PAGE_VIEWS = [EResource.DASHBOARD, EResource.SETTINGS].map((resource) =>
  createPermission(resource, EPermission.PAGE_VIEW),
);

export const DEFAULT_ROLE_PERMISSION_CODES: Record<EUserRole, string[]> = {
  [EUserRole.SUPERADMIN]: [createPermission(EResource.ALL, EPermission.MANAGE), ...ALL_PAGE_VIEWS],
  [EUserRole.SENSEI]: [
    ...SENSEI_PAGE_VIEWS,
    ...permissionCodesFromPairs(
      [EResource.USER, EPermission.LIST],
      [EResource.USER, EPermission.READ],
      [EResource.USER, EPermission.CREATE],
      [EResource.USER, EPermission.UPDATE],
      [EResource.ROLE, EPermission.LIST],
      [EResource.ROLE, EPermission.READ],
      [EResource.PERMISSIONS, EPermission.LIST],
      [EResource.PERMISSIONS, EPermission.READ],
    ),
  ],
  [EUserRole.MENTOR]: [
    ...MENTOR_PAGE_VIEWS,
    ...permissionCodesFromPairs(
      [EResource.USER, EPermission.LIST],
      [EResource.USER, EPermission.READ],
      [EResource.ROLE, EPermission.LIST],
      [EResource.ROLE, EPermission.READ],
    ),
  ],
  [EUserRole.MENTEE]: [
    ...MENTEE_PAGE_VIEWS,
    ...permissionCodesFromPairs([EResource.USER, EPermission.READ]),
  ],
};
