import { EUserRole } from "@/common/enums/roles.enums";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import { permissionCodesFromPairs, toPermissionDefinition } from "./permissions.catalog.helpers";
import { EPermission, EResource } from "./permissions.enums";
import type { IPermissionDefinition } from "./permissions.interfaces";

const DOMAIN_RESOURCES = [
  EResource.USER,
  EResource.ROLE,
  EResource.ORGANIZATION,
  EResource.MEMBER,
  EResource.INVITATION,
  EResource.PERMISSIONS,
] as const;

const DOMAIN_ACTIONS = [
  EPermission.LIST,
  EPermission.READ,
  EPermission.CREATE,
  EPermission.UPDATE,
  EPermission.DELETE,
] as const;

const PAGE_RESOURCES = [
  EResource.DASHBOARD,
  EResource.AI_CHAT,
  EResource.BILLING,
  EResource.SETTINGS,
  EResource.DOCUMENT_VECTOR_STORE,
  EResource.USER,
  EResource.ORGANIZATION,
] as const;

export const DEFAULT_PERMISSION_DEFINITIONS: IPermissionDefinition[] = [
  toPermissionDefinition(EResource.ALL, EPermission.MANAGE, "Full platform manage"),
  ...DOMAIN_RESOURCES.flatMap((resource) =>
    DOMAIN_ACTIONS.map((action) => toPermissionDefinition(resource, action)),
  ),
  toPermissionDefinition(EResource.INVITATION, EPermission.CANCEL),
  ...PAGE_RESOURCES.map((resource) =>
    toPermissionDefinition(resource, EPermission.PAGE_VIEW, `View ${resource} page`),
  ),
];

const ALL_PAGE_VIEWS = PAGE_RESOURCES.map((resource) =>
  createPermission(resource, EPermission.PAGE_VIEW),
);

const MANAGER_PAGE_VIEWS = [
  EResource.DASHBOARD,
  EResource.AI_CHAT,
  EResource.SETTINGS,
  EResource.DOCUMENT_VECTOR_STORE,
  EResource.ORGANIZATION,
].map((resource) => createPermission(resource, EPermission.PAGE_VIEW));

const CUSTOMER_PAGE_VIEWS = [
  EResource.DASHBOARD,
  EResource.AI_CHAT,
  EResource.DOCUMENT_VECTOR_STORE,
  EResource.BILLING,
  EResource.SETTINGS,
  EResource.ORGANIZATION,
].map((resource) => createPermission(resource, EPermission.PAGE_VIEW));

export const DEFAULT_ROLE_PERMISSION_CODES: Record<EUserRole, string[]> = {
  [EUserRole.SUPER_ADMIN]: [createPermission(EResource.ALL, EPermission.MANAGE), ...ALL_PAGE_VIEWS],
  [EUserRole.MANAGER]: [
    ...MANAGER_PAGE_VIEWS,
    ...permissionCodesFromPairs(
      [EResource.USER, EPermission.LIST],
      [EResource.USER, EPermission.READ],
      [EResource.USER, EPermission.UPDATE],
      [EResource.ROLE, EPermission.LIST],
      [EResource.ROLE, EPermission.READ],
      [EResource.ORGANIZATION, EPermission.LIST],
      [EResource.ORGANIZATION, EPermission.READ],
      [EResource.ORGANIZATION, EPermission.UPDATE],
      [EResource.MEMBER, EPermission.LIST],
      [EResource.MEMBER, EPermission.READ],
      [EResource.MEMBER, EPermission.CREATE],
      [EResource.MEMBER, EPermission.UPDATE],
      [EResource.MEMBER, EPermission.DELETE],
      [EResource.INVITATION, EPermission.LIST],
      [EResource.INVITATION, EPermission.READ],
      [EResource.INVITATION, EPermission.CREATE],
      [EResource.INVITATION, EPermission.CANCEL],
    ),
  ],
  [EUserRole.CUSTOMER]: [
    ...CUSTOMER_PAGE_VIEWS,
    ...permissionCodesFromPairs(
      [EResource.USER, EPermission.LIST],
      [EResource.USER, EPermission.READ],
      [EResource.ORGANIZATION, EPermission.LIST],
      [EResource.ORGANIZATION, EPermission.READ],
      [EResource.ORGANIZATION, EPermission.CREATE],
      [EResource.MEMBER, EPermission.LIST],
      [EResource.MEMBER, EPermission.READ],
      [EResource.INVITATION, EPermission.LIST],
      [EResource.INVITATION, EPermission.READ],
      [EResource.INVITATION, EPermission.CREATE],
      [EResource.INVITATION, EPermission.CANCEL],
    ),
  ],
};
