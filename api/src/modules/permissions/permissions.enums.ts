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
