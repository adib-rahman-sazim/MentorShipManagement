import { IUserPermissionOverridesResponse } from "@/shared/typedefs";

export interface IUseUserPermissionsFormParams {
  userId?: string;
  overrides?: IUserPermissionOverridesResponse;
}
