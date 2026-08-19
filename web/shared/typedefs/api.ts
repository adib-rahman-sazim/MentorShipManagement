export interface ICancelInvitationParams {
  id: string;
}

export interface ICancelSubscriptionParams {
  id: string;
}

export interface IChatRequestDto {
  data?: Record<string, any>;
  id?: string;
  messages: IUIMessageDto[];
}

export interface ICheckoutSessionData {
  checkoutUrl: string;
}

export interface ICheckoutSessionResponse {
  data: ICheckoutSessionData;
}

export interface ICompletionRequestDto {
  data?: Record<string, any>;
  id?: string;
  prompt: string;
}

export interface ICreateCheckoutSessionDto {
  /** @format uri */
  cancelUrl: string;
  priceId: string;
  /** @min 1 */
  quantity?: number;
  /** @format uri */
  successUrl: string;
}

export interface ICreateInvitationDto {
  /** @format email */
  email: string;
  /** @minLength 1 */
  firstName?: string;
  /** @minLength 1 */
  lastName?: string;
  /** @format uuid */
  organizationId?: string;
  role: EUserRole;
}

export type ICreateInvitationResultResponse = object;

export interface ICreateOrganizationDto {
  /** @maxLength 255 */
  name: string;
  /**
   * @maxLength 255
   * @pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$
   */
  slug?: string;
}

export enum EAllowedMimeTypes {
  APPLICATION_PDF = "application/pdf",
  IMAGE_PNG = "image/png",
  IMAGE_JPG = "image/jpg",
  IMAGE_JPEG = "image/jpeg",
}

export enum EFeatureFlagKey {
  HEALTH_CHECK = "health_check",
}

export enum EInvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELED = "canceled",
}

export enum EMessagePartType {
  TEXT = "text",
  REASONING = "reasoning",
  SOURCE_URL = "source-url",
  SOURCE_DOCUMENT = "source-document",
  FILE = "file",
  STEP_START = "step-start",
  STEP_FINISH = "step-finish",
}

export enum EMessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

export enum EPaymentCurrency {
  USD = "usd",
}

export enum EPaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

export enum EPaymentType {
  RECURRING = "recurring",
  ONE_OFF = "one_off",
}

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

export enum ESubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  PAST_DUE = "past_due",
  PAUSED = "paused",
  TRIALING = "trialing",
  UNPAID = "unpaid",
}

export enum EUserRole {
  SUPER_ADMIN = "super_admin",
  MANAGER = "manager",
  CUSTOMER = "customer",
}

export enum EUserState {
  UNREGISTERED = "UNREGISTERED",
  NOT_ONBOARDED = "NOT_ONBOARDED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IFeatureFlagKeysResponse {
  keys: EFeatureFlagKey[];
}

export interface IGetInvitationParams {
  id: string;
}

export interface IGetMyCaslRulesResponse {
  rules: INormalizedCaslRuleResponse[];
}

export interface IGetPaymentsParams {
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
}

export interface IInvitationResponse {
  role: EUserRole;
  status: EInvitationStatus;
}

export interface IInviteUserDto {
  /** @format email */
  email: string;
  firstName: string;
  lastName: string;
  role?: EUserRole;
}

export interface IListInvitationsParams {
  /**
   * @min 1
   * @default 10
   */
  limit?: number;
  /** @format uuid */
  organizationId?: string;
  /**
   * @min 1
   * @default 1
   */
  page?: number;
  status?: string;
}

export interface IListMembersParams {
  id: string;
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
}

export interface IListOrganizationsParams {
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
}

export interface IListUsersParams {
  /**
   * @min 1
   * @default 10
   */
  limit?: number;
  /**
   * @min 1
   * @default 1
   */
  page?: number;
  search?: string;
  state?: EUserState;
}

export interface IMessagePartDto {
  text?: string;
  type: EMessagePartType;
}

export interface INormalizedCaslRuleResponse {
  action: EPermission[];
  conditions?: Record<string, any>;
  fields?: string[];
  inverted?: boolean;
  reason?: string;
  subject: EResource[];
}

export interface IOrganizationInvitationValidationResponse {
  role: EUserRole;
  status: EInvitationStatus;
}

export type IOrganizationResponse = object;

export interface IPaginatedInvitationsResponse {
  meta: IPaginationMetadataResponse;
}

export interface IPaginatedOrganizationMembersResponse {
  meta: IPaginationMetadataResponse;
}

export interface IPaginatedOrganizationsResponse {
  meta: IPaginationMetadataResponse;
}

export interface IPaginationMetadataResponse {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface IPaymentItem {
  amount: number;
  /** @format date-time */
  createdAt: string;
  currency: EPaymentCurrency;
  description: string;
  id: string;
  priceId: string;
  quantity: number;
  status: EPaymentStatus;
  type: EPaymentType;
  /** @format date-time */
  updatedAt: string;
}

export interface IPaymentListResponse {
  data: IPaymentItem[];
  meta: IPaginationMetadataResponse;
}

export interface IPresignedUrlFile {
  name: string;
  type: EAllowedMimeTypes;
}

export interface IPresignedUrlFileDto {
  /** @minItems 1 */
  files: IPresignedUrlFile[];
}

export interface IPresignedUrlResponse {
  name: string;
  signedUrl: string;
  type: EAllowedMimeTypes;
}

export interface IPriceItem {
  amount: number;
  currency: EPaymentCurrency;
  id: string;
  product: IPriceItemProduct;
  recurring: IPriceItemRecurring | null;
}

export interface IPriceItemProduct {
  description: string | null;
  id: string;
  name: string;
}

export interface IPriceItemRecurring {
  interval: string;
  intervalCount: number;
  trialPeriodDays: number | null;
}

export interface IPriceListResponse {
  data: IPriceItem[];
}

export interface IQueryDocumentRequestDto {
  /**
   * @min 1
   * @max 20
   * @default 5
   */
  maxResults?: number;
  query: string;
}

export interface IQueryDocumentResponseDto {
  results: IQueryDocumentResultDto[];
}

export interface IQueryDocumentResultDto {
  content: string;
  fileId: string;
  filename: string;
  score: number;
}

export interface IResendInvitationParams {
  id: string;
}

export interface IResumeSubscriptionParams {
  id: string;
}

export interface ISubscriptionDto {
  cancelAtPeriodEnd: boolean;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  currentPeriodEndAt: string;
  /** @format date-time */
  currentPeriodStartAt: string;
  id: string;
  priceId: string;
  status: ESubscriptionStatus;
  /** @format date-time */
  updatedAt: string;
}

export interface ISubscriptionListResponseDto {
  data: ISubscriptionDto[];
}

export interface ISystemInvitationValidationResponse {
  role: EUserRole;
  status: EInvitationStatus;
}

export interface IUIMessageDto {
  id: string;
  metadata?: Record<string, Record<string, any>>;
  parts: IMessagePartDto[];
  role: EMessageRole;
}

export interface IUpdateMemberRoleDto {
  /** @minItems 1 */
  roleSlugs: EUserRole[];
  userId: string;
}

export interface IUpdateProfileDto {
  firstName?: string;
  /** @format uri */
  image?: string;
  lastName?: string;
  name?: string;
}

export interface IUpdateSystemRolesDto {
  roleSlugs: EUserRole[];
  userId: string;
}

export interface IUpdateUserDto {
  firstName?: string;
  /** @format uri */
  image?: string;
  lastName?: string;
  name?: string;
  state?: EUserState;
}

export interface IUpdateUserParams {
  id: string;
}

export interface IUploadDocumentRequestDto {
  fileKey: string;
}

export interface IUploadDocumentResponseDto {
  fileId: string;
  filename: string;
  vectorStoreId: string;
}

export interface IValidateOrganizationInvitationParams {
  /** @format uuid */
  id: string;
}

export interface IValidateSystemInvitationParams {
  token: string;
}
