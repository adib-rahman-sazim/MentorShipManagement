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

const PAGE_RESOURCES = [
  EResource.DASHBOARD,
  EResource.SETTINGS,
  EResource.USER,
  EResource.MENTORSHIP_GRAPH,
] as const;

const MMS_DOMAIN_PERMISSION_PAIRS: Array<[EResource, EPermission]> = [
  [EResource.MENTORSHIP, EPermission.ASSIGN],
  [EResource.DRAFT, EPermission.CREATE],
  [EResource.DRAFT, EPermission.REVIEW],
  [EResource.DRAFT, EPermission.APPROVE],
];

export const DEFAULT_PERMISSION_DEFINITIONS: IPermissionDefinition[] = [
  toPermissionDefinition(EResource.ALL, EPermission.MANAGE, "Full platform manage"),
  ...DOMAIN_RESOURCES.flatMap((resource) =>
    DOMAIN_ACTIONS.map((action) => toPermissionDefinition(resource, action)),
  ),
  ...MMS_DOMAIN_PERMISSION_PAIRS.map(([resource, action]) =>
    toPermissionDefinition(resource, action),
  ),
  ...PAGE_RESOURCES.map((resource) =>
    toPermissionDefinition(resource, EPermission.PAGE_VIEW, `View ${resource} page`),
  ),
];

const HIERARCHY_PAGE_VIEWS = [
  EResource.DASHBOARD,
  EResource.SETTINGS,
  EResource.MENTORSHIP_GRAPH,
].map((resource) => createPermission(resource, EPermission.PAGE_VIEW));

const MENTEE_PAGE_VIEWS = [EResource.DASHBOARD, EResource.SETTINGS].map((resource) =>
  createPermission(resource, EPermission.PAGE_VIEW),
);

export const DEFAULT_ROLE_PERMISSION_CODES: Record<EUserRole, string[]> = {
  [EUserRole.SUPERADMIN]: [createPermission(EResource.ALL, EPermission.MANAGE)],
  [EUserRole.SENSEI]: [
    ...HIERARCHY_PAGE_VIEWS,
    ...permissionCodesFromPairs(...MMS_DOMAIN_PERMISSION_PAIRS),
    ...permissionCodesFromPairs(
      [EResource.USER, EPermission.LIST],
      [EResource.USER, EPermission.READ],
    ),
  ],
  [EUserRole.MENTOR]: [...HIERARCHY_PAGE_VIEWS],
  [EUserRole.MENTEE]: [
    ...MENTEE_PAGE_VIEWS,
    ...permissionCodesFromPairs([EResource.USER, EPermission.READ]),
  ],
};
