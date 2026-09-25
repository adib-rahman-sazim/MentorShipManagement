import { EPermissionCode } from "@/shared/typedefs";

import { EPermissionGroup } from "./permissions.enums";
import type { IPermissionDetails, IPermissionGroupDefinition } from "./permissions.interfaces";

export const USER_ID_QUERY_PARAM = "userId";

export const HIDDEN_PERMISSION_CODES: readonly EPermissionCode[] = [
  EPermissionCode.CAN_MANAGE_ALL,
  EPermissionCode.CAN_LIST_ROLES,
  EPermissionCode.CAN_READ_ROLE,
  EPermissionCode.CAN_CREATE_ROLE,
  EPermissionCode.CAN_UPDATE_ROLE,
  EPermissionCode.CAN_DELETE_ROLE,
  EPermissionCode.CAN_LIST_PERMISSIONS,
  EPermissionCode.CAN_READ_PERMISSION,
  EPermissionCode.CAN_CREATE_PERMISSION,
  EPermissionCode.CAN_UPDATE_PERMISSION,
  EPermissionCode.CAN_DELETE_PERMISSION,
];

export const PERMISSION_DETAILS: Record<EPermissionCode, IPermissionDetails> = {
  [EPermissionCode.CAN_MANAGE_ALL]: {
    label: "Full platform access",
    description: "Everything on the platform. Only the Superadmin holds this.",
  },
  [EPermissionCode.CAN_VIEW_DASHBOARD]: {
    label: "Home page",
    description: "Show the Home page in their sidebar.",
  },
  [EPermissionCode.CAN_VIEW_USERS_PAGE]: {
    label: "Users page",
    description: "Show the Users page in their sidebar.",
  },
  [EPermissionCode.CAN_VIEW_MENTORSHIP_GRAPH]: {
    label: "Mentorship graph page",
    description: "Show the mentorship graph in their sidebar.",
  },
  [EPermissionCode.CAN_VIEW_SETTINGS]: {
    label: "Settings page",
    description: "Show their own Settings page.",
  },
  [EPermissionCode.CAN_LIST_USERS]: {
    label: "List users",
    description: "See the list of everyone on the platform.",
  },
  [EPermissionCode.CAN_READ_USER]: {
    label: "View people",
    description: "Open a person's profile. Limited to people above or below them in the hierarchy.",
  },
  [EPermissionCode.CAN_CREATE_USER]: {
    label: "Create users",
    description: "Add new people to the platform.",
  },
  [EPermissionCode.CAN_UPDATE_USER]: {
    label: "Edit people",
    description: "Change a person's details. Limited to people below them in the hierarchy.",
  },
  [EPermissionCode.CAN_DELETE_USER]: {
    label: "Delete people",
    description: "Remove a person. Limited to people below them in the hierarchy.",
  },
  [EPermissionCode.CAN_ASSIGN_MENTOR]: {
    label: "Assign mentors",
    description: "Place a mentee under a mentor.",
  },
  [EPermissionCode.CAN_CREATE_DRAFT]: {
    label: "Draft mentorship changes",
    description: "Propose changes to the hierarchy for someone to review.",
  },
  [EPermissionCode.CAN_REVIEW_DRAFT]: {
    label: "Review drafts",
    description: "Review proposed mentorship changes.",
  },
  [EPermissionCode.CAN_APPROVE_DRAFT]: {
    label: "Approve drafts",
    description: "Approve proposed mentorship changes so they can be published.",
  },
  [EPermissionCode.CAN_LIST_ROLES]: {
    label: "List roles",
    description: "See every role on the platform.",
  },
  [EPermissionCode.CAN_READ_ROLE]: {
    label: "View roles",
    description: "See what a role contains.",
  },
  [EPermissionCode.CAN_CREATE_ROLE]: {
    label: "Create roles",
    description: "Add a new role.",
  },
  [EPermissionCode.CAN_UPDATE_ROLE]: {
    label: "Edit roles",
    description: "Change what a role contains.",
  },
  [EPermissionCode.CAN_DELETE_ROLE]: {
    label: "Delete roles",
    description: "Remove a role.",
  },
  [EPermissionCode.CAN_LIST_PERMISSIONS]: {
    label: "List permissions",
    description: "See the full permission catalog.",
  },
  [EPermissionCode.CAN_READ_PERMISSION]: {
    label: "View permissions",
    description: "See a person's permissions and where each one comes from.",
  },
  [EPermissionCode.CAN_CREATE_PERMISSION]: {
    label: "Create permissions",
    description: "Add a permission to the catalog.",
  },
  [EPermissionCode.CAN_UPDATE_PERMISSION]: {
    label: "Change permissions",
    description: "Add or remove a person's permissions.",
  },
  [EPermissionCode.CAN_DELETE_PERMISSION]: {
    label: "Delete permissions",
    description: "Remove a permission from the catalog.",
  },
};

export const PERMISSION_GROUPS: IPermissionGroupDefinition[] = [
  {
    group: EPermissionGroup.PAGES,
    title: "Pages",
    description: "Which pages they can open.",
    codes: [
      EPermissionCode.CAN_VIEW_DASHBOARD,
      EPermissionCode.CAN_VIEW_USERS_PAGE,
      EPermissionCode.CAN_VIEW_MENTORSHIP_GRAPH,
      EPermissionCode.CAN_VIEW_SETTINGS,
    ],
  },
  {
    group: EPermissionGroup.USERS,
    title: "People",
    description: "What they can see and do with other people's accounts.",
    codes: [
      EPermissionCode.CAN_LIST_USERS,
      EPermissionCode.CAN_READ_USER,
      EPermissionCode.CAN_CREATE_USER,
      EPermissionCode.CAN_UPDATE_USER,
      EPermissionCode.CAN_DELETE_USER,
    ],
  },
  {
    group: EPermissionGroup.MENTORSHIP,
    title: "Mentorship",
    description: "Assigning mentors and working with drafts.",
    codes: [
      EPermissionCode.CAN_ASSIGN_MENTOR,
      EPermissionCode.CAN_CREATE_DRAFT,
      EPermissionCode.CAN_REVIEW_DRAFT,
      EPermissionCode.CAN_APPROVE_DRAFT,
    ],
  },
];

export const OTHER_PERMISSION_GROUP: IPermissionGroupDefinition = {
  group: EPermissionGroup.OTHER,
  title: "Other",
  description: "Permissions that are not in a group yet.",
  codes: [],
};

export const UNSAVED_CHANGE_LABEL = "unsaved change";
export const UNSAVED_CHANGES_LABEL = "unsaved changes";
