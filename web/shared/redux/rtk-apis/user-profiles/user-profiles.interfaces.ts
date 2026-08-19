import { EUserState } from "@/shared/typedefs/api";

export interface ICurrentUserProfileResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  name: string;
  image?: string;
  state: EUserState;
  firstLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateProfileDto {
  firstName?: string;
  lastName?: string;
  name?: string;
  image?: string;
}
