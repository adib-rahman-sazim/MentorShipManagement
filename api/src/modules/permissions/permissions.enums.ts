export enum EPermission {
  PAGE_VIEW = "page_view",
  LIST = "list",
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
  ASSIGN = "assign",
  REVIEW = "review",
  APPROVE = "approve",
}

export enum EResource {
  ALL = "all",
  USER = "user",
  ROLE = "role",
  PERMISSIONS = "permissions",
  DASHBOARD = "dashboard",
  SETTINGS = "settings",
  MENTORSHIP = "mentorship",
  DRAFT = "draft",
  MENTORSHIP_GRAPH = "mentorship_graph",
}

export enum EPermissionConditionType {
  NONE = "none",
}

export enum EPermissionCode {
  CAN_MANAGE_ALL = "can_manage_all",
  CAN_LIST_USERS = "can_list_users",
  CAN_READ_USER = "can_read_user",
  CAN_CREATE_USER = "can_create_user",
  CAN_UPDATE_USER = "can_update_user",
  CAN_DELETE_USER = "can_delete_user",
  CAN_LIST_ROLES = "can_list_roles",
  CAN_READ_ROLE = "can_read_role",
  CAN_CREATE_ROLE = "can_create_role",
  CAN_UPDATE_ROLE = "can_update_role",
  CAN_DELETE_ROLE = "can_delete_role",
  CAN_LIST_PERMISSIONS = "can_list_permissions",
  CAN_READ_PERMISSION = "can_read_permission",
  CAN_CREATE_PERMISSION = "can_create_permission",
  CAN_UPDATE_PERMISSION = "can_update_permission",
  CAN_DELETE_PERMISSION = "can_delete_permission",
  CAN_ASSIGN_MENTOR = "can_assign_mentor",
  CAN_CREATE_DRAFT = "can_create_draft",
  CAN_REVIEW_DRAFT = "can_review_draft",
  CAN_APPROVE_DRAFT = "can_approve_draft",
  CAN_VIEW_DASHBOARD = "can_view_dashboard",
  CAN_VIEW_SETTINGS = "can_view_settings",
  CAN_VIEW_USERS_PAGE = "can_view_users_page",
  CAN_VIEW_MENTORSHIP_GRAPH = "can_view_mentorship_graph",
}
