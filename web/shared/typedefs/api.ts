export interface IApproveDraftParams {
  id: string;
}

export interface IAuthErrorResponse {
  errorCode?: EAuthErrorCode;
  errors: object[];
  message: string;
  statusCode: number;
}

export interface ICancelDraftParams {
  id: string;
}

export interface ICreateMentorshipDraftDto {
  /**
   * @maxItems 100
   * @uniqueItems true
   */
  items: IMentorshipDraftItemDto[];
  /** @maxLength 255 */
  title: string;
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

export interface IDecideMentorshipDraftDto {
  /** @maxLength 2000 */
  decisionComment?: string;
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

export enum EMentorshipDraftAction {
  EDIT = "edit",
  SUBMIT = "submit",
  APPROVE = "approve",
  REJECT = "reject",
  PUBLISH = "publish",
  CANCEL = "cancel",
}

export enum EMentorshipDraftErrorCode {
  MENTORSHIP_DRAFT_INVALID_ITEMS = "MENTORSHIP_DRAFT_INVALID_ITEMS",
  MENTORSHIP_DRAFT_STALE_ITEMS = "MENTORSHIP_DRAFT_STALE_ITEMS",
}

export enum EMentorshipDraftOperation {
  ASSIGN = "ASSIGN",
  REASSIGN = "REASSIGN",
  UNASSIGN = "UNASSIGN",
}

export enum EMentorshipDraftStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
}

export enum EMentorshipRelationshipType {
  SENSEI_MENTOR = "SENSEI_MENTOR",
  MENTOR_MENTEE = "MENTOR_MENTEE",
}

export enum EMentorshipViolation {
  SELF_MENTORSHIP = "SELF_MENTORSHIP",
  ILLEGAL_ROLE_PAIR = "ILLEGAL_ROLE_PAIR",
  CYCLE = "CYCLE",
  INACTIVE_USER = "INACTIVE_USER",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  ALREADY_ASSIGNED = "ALREADY_ASSIGNED",
  NOT_ASSIGNED = "NOT_ASSIGNED",
  SAME_SUPERVISOR = "SAME_SUPERVISOR",
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
  PUBLISH = "publish",
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
  CAN_READ_DRAFT = "can_read_draft",
  CAN_REVIEW_DRAFT = "can_review_draft",
  CAN_APPROVE_DRAFT = "can_approve_draft",
  CAN_PUBLISH_DRAFT = "can_publish_draft",
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

export interface IGetDraftChangeSummaryParams {
  id: string;
}

export interface IGetDraftParams {
  id: string;
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

export interface IListDraftsParams {
  /**
   * @min 1
   * @default 10
   */
  limit: number;
  /** @default false */
  mine?: boolean;
  /**
   * @min 1
   * @default 1
   */
  page: number;
  status?: EMentorshipDraftStatus;
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

export interface IMentorshipChainLinkResponse {
  depth: number;
  /** @format uuid */
  mentorshipId: string;
  relationshipType: EMentorshipRelationshipType;
  /** @format date-time */
  startedAt: string;
  supervisor: IMentorshipPersonResponse;
}

export interface IMentorshipDraftApiResponse {
  data: IMentorshipDraftResponse;
  message: string;
  statusCode: number;
}

export interface IMentorshipDraftChangeSummaryApiResponse {
  data: IMentorshipDraftChangeSummaryResponse;
  message: string;
  statusCode: number;
}

export interface IMentorshipDraftChangeSummaryItemResponse {
  currentSupervisor: IMentorshipDraftPersonResponse | null;
  expectedSupervisor: IMentorshipDraftPersonResponse | null;
  /** @format uuid */
  id: string;
  operation: EMentorshipDraftOperation;
  overlaps: IMentorshipDraftOverlapResponse[];
  proposedSupervisor: IMentorshipDraftPersonResponse | null;
  relationshipType: EMentorshipRelationshipType | null;
  stale: IMentorshipDraftStaleChangeResponse | null;
  subordinate: IMentorshipDraftPersonResponse;
  violations: EMentorshipViolation[];
}

export interface IMentorshipDraftChangeSummaryResponse {
  /** @format uuid */
  draftId: string;
  items: IMentorshipDraftChangeSummaryItemResponse[];
}

export interface IMentorshipDraftDetailApiResponse {
  data: IMentorshipDraftDetailResponse;
  message: string;
  statusCode: number;
}

export interface IMentorshipDraftDetailItemResponse {
  /** @format uuid */
  expectedCurrentMentorshipId: string | null;
  /** @format uuid */
  id: string;
  operation: EMentorshipDraftOperation;
  proposedSupervisor: IMentorshipDraftPersonResponse | null;
  subordinate: IMentorshipDraftPersonResponse;
}

export interface IMentorshipDraftDetailResponse {
  allowedActions: EMentorshipDraftAction[];
  approvedBy: IMentorshipDraftPersonResponse | null;
  /** @format date-time */
  cancelledAt: string | null;
  cancelledBy: IMentorshipDraftPersonResponse | null;
  /** @format date-time */
  createdAt: string;
  createdBy: IMentorshipDraftPersonResponse;
  /** @format date-time */
  decidedAt: string | null;
  decisionComment: string | null;
  /** @format uuid */
  id: string;
  itemCount: number;
  items: IMentorshipDraftDetailItemResponse[];
  /** @format date-time */
  publishedAt: string | null;
  publishedBy: IMentorshipDraftPersonResponse | null;
  reviewedBy: IMentorshipDraftPersonResponse | null;
  status: EMentorshipDraftStatus;
  /** @format date-time */
  submittedAt: string | null;
  title: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IMentorshipDraftInvalidItemsResponse {
  errorCode: EMentorshipDraftErrorCode;
  errors: IMentorshipDraftItemViolationResponse[];
  message: string;
  statusCode: number;
}

export interface IMentorshipDraftItemDto {
  operation: EMentorshipDraftOperation;
  /** @format uuid */
  proposedSupervisorId?: string | null;
  /** @format uuid */
  subordinateId: string;
}

export interface IMentorshipDraftItemResponse {
  /** @format uuid */
  expectedCurrentMentorshipId: string | null;
  /** @format uuid */
  id: string;
  operation: EMentorshipDraftOperation;
  /** @format uuid */
  proposedSupervisorId: string | null;
  /** @format uuid */
  subordinateId: string;
}

export interface IMentorshipDraftItemViolationResponse {
  /** @format uuid */
  subordinateId: string;
  violations: EMentorshipViolation[];
}

export interface IMentorshipDraftOverlapResponse {
  /** @format uuid */
  id: string;
  status: EMentorshipDraftStatus;
  title: string;
}

export interface IMentorshipDraftPersonResponse {
  /** @format uuid */
  id: string;
  name: string;
  role: EUserRole;
}

export interface IMentorshipDraftResponse {
  /** @format date-time */
  createdAt: string;
  /** @format uuid */
  createdById: string;
  /** @format uuid */
  id: string;
  items: IMentorshipDraftItemResponse[];
  status: EMentorshipDraftStatus;
  title: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IMentorshipDraftStaleChangeResponse {
  /** @format uuid */
  changedByDraftId: string | null;
}

export interface IMentorshipDraftStaleItemResponse {
  /** @format uuid */
  changedByDraftId: string | null;
  /** @format uuid */
  currentSupervisorId: string | null;
  /** @format uuid */
  expectedSupervisorId: string | null;
  /** @format uuid */
  subordinateId: string;
}

export interface IMentorshipDraftStaleItemsResponse {
  errorCode: EMentorshipDraftErrorCode;
  errors: IMentorshipDraftStaleItemResponse[];
  message: string;
  statusCode: number;
}

export interface IMentorshipDraftSummaryResponse {
  allowedActions: EMentorshipDraftAction[];
  /** @format date-time */
  cancelledAt: string | null;
  /** @format date-time */
  createdAt: string;
  createdBy: IMentorshipDraftPersonResponse;
  /** @format date-time */
  decidedAt: string | null;
  /** @format uuid */
  id: string;
  itemCount: number;
  /** @format date-time */
  publishedAt: string | null;
  status: EMentorshipDraftStatus;
  /** @format date-time */
  submittedAt: string | null;
  title: string;
  /** @format date-time */
  updatedAt: string;
}

export interface IMentorshipGraphApiResponse {
  data: IMentorshipGraphResponse;
  message: string;
  statusCode: number;
}

export interface IMentorshipGraphEdgeResponse {
  /** @format uuid */
  id: string;
  relationshipType: EMentorshipRelationshipType;
  /** @format date-time */
  startedAt: string;
  /** @format uuid */
  subordinateId: string;
  /** @format uuid */
  supervisorId: string;
}

export interface IMentorshipGraphNodeResponse {
  /** @format email */
  email: string;
  /** @format uuid */
  id: string;
  name: string;
  role: EUserRole;
  state: EUserState;
}

export interface IMentorshipGraphResponse {
  edges: IMentorshipGraphEdgeResponse[];
  nodes: IMentorshipGraphNodeResponse[];
}

export interface IMentorshipPersonResponse {
  /** @format uuid */
  id: string;
  name: string;
  role: EUserRole;
}

export interface IMentorshipTeamNodeResponse {
  /** @format uuid */
  mentorshipId: string;
  relationshipType: EMentorshipRelationshipType;
  /** @format date-time */
  startedAt: string;
  team: IMentorshipTeamNodeResponse[];
  user: IMentorshipPersonResponse;
}

export interface IMyMentorshipApiResponse {
  data: IMyMentorshipResponse;
  message: string;
  statusCode: number;
}

export interface IMyMentorshipResponse {
  supervisors: IMentorshipChainLinkResponse[];
  team: IMentorshipTeamNodeResponse[];
}

export interface INormalizedCaslRuleResponse {
  action: EPermission[];
  conditions?: Record<string, any>;
  fields?: string[];
  inverted?: boolean;
  reason?: string;
  subject: EResource[];
}

export interface IPaginatedMentorshipDraftsApiResponse {
  data: IPaginatedMentorshipDraftsResponse;
  message: string;
  statusCode: number;
}

export interface IPaginatedMentorshipDraftsResponse {
  data: IMentorshipDraftSummaryResponse[];
  meta: IPaginationMetaResponse;
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

export interface IPublishDraftParams {
  id: string;
}

export interface IRejectDraftParams {
  id: string;
}

export interface IReplaceUserPermissionOverridesDto {
  overrides: IUserPermissionOverrideDto[];
  /** @maxLength 500 */
  reason?: string;
}

export interface IReplaceUserPermissionOverridesParams {
  userId: string;
}

export interface ISubmitDraftParams {
  id: string;
}

export interface IUpdateDraftParams {
  id: string;
}

export interface IUpdateMentorshipDraftDto {
  /**
   * @maxItems 100
   * @uniqueItems true
   */
  items?: IMentorshipDraftItemDto[];
  /** @maxLength 255 */
  title?: string;
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
  roleDefault: boolean;
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
  editable: boolean;
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
