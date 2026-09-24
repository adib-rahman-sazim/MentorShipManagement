export interface IAuthErrorResponse {
  errorCode?: EAuthErrorCode;
  errors: object[];
  message: string;
  statusCode: number;
}

export interface ICreateUserDto {
  /** @format email */
  email: string;
  /** @format uri */
  image?: string;
  name: string;
  /**
   * @minLength 8
   * @maxLength 128
   */
  password: string;
  role: EUserRole;
  state?: EUserState;
}

export interface IDeleteUserParams {
  id: string;
}

export enum EAuthErrorCode {
  ACCOUNT_DEACTIVATED = "ACCOUNT_DEACTIVATED",
  ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND",
}

export enum EFeatureFlagKey {
  HEALTH_CHECK = "health_check",
}

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

export enum EPermissionOverrideEffect {
  ALLOW = "ALLOW",
  REVOKE = "REVOKE",
}

export enum EPermissionSource {
  ROLE = "ROLE",
  GRANTED = "GRANTED",
  REVOKED = "REVOKED",
  NONE = "NONE",
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

export enum EUserRole {
  SUPERADMIN = "SUPERADMIN",
  SENSEI = "SENSEI",
  MENTOR = "MENTOR",
  MENTEE = "MENTEE",
}

export enum EUserState {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IFeatureFlagKeysResponse {
  keys: EFeatureFlagKey[];
}

export interface IGetMyCaslRulesResponse {
  rules: INormalizedCaslRuleResponse[];
}

export interface IGetUserParams {
  id: string;
}

export interface IGetUserPermissionOverridesParams {
  userId: string;
}

export interface IListUsersParams {
  /**
   * @min 1
   * @default 10
   */
  limit: number;
  /**
   * @min 1
   * @default 1
   */
  page: number;
  search?: string;
  state?: EUserState;
}

export interface INormalizedCaslRuleResponse {
  action: EPermission[];
  conditions?: Record<string, any>;
  fields?: string[];
  inverted?: boolean;
  reason?: string;
  subject: EResource[];
}

export interface IPaginatedUsersApiResponse {
  data: IPaginatedUsersResponse;
  message: string;
  statusCode: number;
}

export interface IPaginatedUsersResponse {
  data: IUserResponse[];
  meta: IPaginationMetaResponse;
}

export interface IPaginationMetaResponse {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface IReplaceUserPermissionOverridesDto {
  overrides: IUserPermissionOverrideDto[];
  /** @maxLength 500 */
  reason?: string;
}

export interface IReplaceUserPermissionOverridesParams {
  userId: string;
}

export interface IUpdateProfileDto {
  /** @format uri */
  image?: string;
  name?: string;
}

export interface IUpdateUserDto {
  /** @format uri */
  image?: string;
  name?: string;
  role?: EUserRole;
  state?: EUserState;
}

export interface IUpdateUserParams {
  id: string;
}

export interface IUserApiResponse {
  data: IUserResponse;
  message: string;
  statusCode: number;
}

export interface IUserPermissionEntryResponse {
  action: EPermission;
  code: EPermissionCode;
  description?: string;
  effective: boolean;
  resource: EResource;
  source: EPermissionSource;
}

export interface IUserPermissionOverrideDto {
  effect: EPermissionOverrideEffect;
  permissionCode: EPermissionCode;
}

export interface IUserPermissionOverridesApiResponse {
  data: IUserPermissionOverridesResponse;
  message: string;
  statusCode: number;
}

export interface IUserPermissionOverridesResponse {
  permissions: IUserPermissionEntryResponse[];
  role: EUserRole;
  /** @format uuid */
  userId: string;
}

export interface IUserResponse {
  /** @format date-time */
  createdAt: string;
  /** @format email */
  email: string;
  emailVerified: boolean;
  /** @format uuid */
  id: string;
  image?: string;
  name: string;
  role: EUserRole;
  state: EUserState;
  /** @format date-time */
  updatedAt: string;
}
