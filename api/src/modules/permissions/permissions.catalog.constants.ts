import { EUserRole } from "@/common/enums/roles.enums";

import { toPermissionDefinition } from "./permissions.catalog.helpers";
import { EPermission, EPermissionCode, EResource } from "./permissions.enums";
import type { IPermissionDefinition } from "./permissions.interfaces";

export const ALL_MANAGE_PERMISSION_CODE = EPermissionCode.CAN_MANAGE_ALL;

export const DEFAULT_PERMISSION_DEFINITIONS: IPermissionDefinition[] = [
  toPermissionDefinition(
    EPermissionCode.CAN_MANAGE_ALL,
    EResource.ALL,
    EPermission.MANAGE,
    "Full platform manage",
  ),
  toPermissionDefinition(EPermissionCode.CAN_LIST_USERS, EResource.USER, EPermission.LIST),
  toPermissionDefinition(EPermissionCode.CAN_READ_USER, EResource.USER, EPermission.READ),
  toPermissionDefinition(EPermissionCode.CAN_CREATE_USER, EResource.USER, EPermission.CREATE),
  toPermissionDefinition(EPermissionCode.CAN_UPDATE_USER, EResource.USER, EPermission.UPDATE),
  toPermissionDefinition(EPermissionCode.CAN_DELETE_USER, EResource.USER, EPermission.DELETE),
  toPermissionDefinition(EPermissionCode.CAN_LIST_ROLES, EResource.ROLE, EPermission.LIST),
  toPermissionDefinition(EPermissionCode.CAN_READ_ROLE, EResource.ROLE, EPermission.READ),
  toPermissionDefinition(EPermissionCode.CAN_CREATE_ROLE, EResource.ROLE, EPermission.CREATE),
  toPermissionDefinition(EPermissionCode.CAN_UPDATE_ROLE, EResource.ROLE, EPermission.UPDATE),
  toPermissionDefinition(EPermissionCode.CAN_DELETE_ROLE, EResource.ROLE, EPermission.DELETE),
  toPermissionDefinition(
    EPermissionCode.CAN_LIST_PERMISSIONS,
    EResource.PERMISSIONS,
    EPermission.LIST,
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_READ_PERMISSION,
    EResource.PERMISSIONS,
    EPermission.READ,
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_CREATE_PERMISSION,
    EResource.PERMISSIONS,
    EPermission.CREATE,
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_UPDATE_PERMISSION,
    EResource.PERMISSIONS,
    EPermission.UPDATE,
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_DELETE_PERMISSION,
    EResource.PERMISSIONS,
    EPermission.DELETE,
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_ASSIGN_MENTOR,
    EResource.MENTORSHIP,
    EPermission.ASSIGN,
  ),
  toPermissionDefinition(EPermissionCode.CAN_CREATE_DRAFT, EResource.DRAFT, EPermission.CREATE),
  toPermissionDefinition(EPermissionCode.CAN_REVIEW_DRAFT, EResource.DRAFT, EPermission.REVIEW),
  toPermissionDefinition(EPermissionCode.CAN_APPROVE_DRAFT, EResource.DRAFT, EPermission.APPROVE),
  toPermissionDefinition(
    EPermissionCode.CAN_VIEW_DASHBOARD,
    EResource.DASHBOARD,
    EPermission.PAGE_VIEW,
    "View dashboard page",
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_VIEW_SETTINGS,
    EResource.SETTINGS,
    EPermission.PAGE_VIEW,
    "View settings page",
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_VIEW_USERS_PAGE,
    EResource.USER,
    EPermission.PAGE_VIEW,
    "View user page",
  ),
  toPermissionDefinition(
    EPermissionCode.CAN_VIEW_MENTORSHIP_GRAPH,
    EResource.MENTORSHIP_GRAPH,
    EPermission.PAGE_VIEW,
    "View mentorship_graph page",
  ),
];

const HIERARCHY_PAGE_VIEW_CODES = [
  EPermissionCode.CAN_VIEW_DASHBOARD,
  EPermissionCode.CAN_VIEW_SETTINGS,
  EPermissionCode.CAN_VIEW_MENTORSHIP_GRAPH,
];

const MMS_DOMAIN_CODES = [
  EPermissionCode.CAN_ASSIGN_MENTOR,
  EPermissionCode.CAN_CREATE_DRAFT,
  EPermissionCode.CAN_REVIEW_DRAFT,
  EPermissionCode.CAN_APPROVE_DRAFT,
];

export const DEFAULT_ROLE_PERMISSION_CODES: Record<EUserRole, EPermissionCode[]> = {
  [EUserRole.SUPERADMIN]: [EPermissionCode.CAN_MANAGE_ALL],
  [EUserRole.SENSEI]: [
    ...HIERARCHY_PAGE_VIEW_CODES,
    ...MMS_DOMAIN_CODES,
    EPermissionCode.CAN_LIST_USERS,
    EPermissionCode.CAN_READ_USER,
  ],
  [EUserRole.MENTOR]: [...HIERARCHY_PAGE_VIEW_CODES],
  [EUserRole.MENTEE]: [...HIERARCHY_PAGE_VIEW_CODES, EPermissionCode.CAN_READ_USER],
};

export const PERMISSION_DEFINITIONS_BY_CODE = new Map<EPermissionCode, IPermissionDefinition>(
  DEFAULT_PERMISSION_DEFINITIONS.map((definition) => [definition.code, definition]),
);
