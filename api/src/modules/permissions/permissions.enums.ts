export enum EPermission {
  PAGE_VIEW = "page_view",
  LIST = "list",
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  CANCEL = "cancel",
  MANAGE = "manage",
}

export enum EResource {
  ALL = "all",
  USER = "user",
  ROLE = "role",
  ORGANIZATION = "organization",
  MEMBER = "member",
  INVITATION = "invitation",
  PERMISSIONS = "permissions",
  DASHBOARD = "dashboard",
  AI_CHAT = "ai_chat",
  BILLING = "billing",
  SETTINGS = "settings",
  DOCUMENT_VECTOR_STORE = "document_vector_store",
}

export enum EPermissionConditionType {
  NONE = "none",
  ORGANIZATION_ID = "organization_id",
  ORGANIZATION_RESOURCE_ID = "organization_resource_id",
}
