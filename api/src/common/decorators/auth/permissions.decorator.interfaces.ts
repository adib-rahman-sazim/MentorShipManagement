/**
 * Options for @Permissions decorator.
 *
 * `permissions` are CASL permission codes from createPermission(), e.g. "user:list:allow".
 */
export interface IPermissionsOptions {
  permissions: string[];
  /**
   * When true, callers without an active organization are rejected unless they
   * already have the required ability (e.g. manage:all) or hold a system-level role.
   */
  requireActiveOrganization?: boolean;
}
