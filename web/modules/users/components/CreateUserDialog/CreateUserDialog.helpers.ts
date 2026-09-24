import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  ROLE_NOT_ASSIGNABLE_MESSAGE,
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from "@/modules/users/users.constants";
import { isAssignableUserRole } from "@/modules/users/users.helpers";
import { EUserRole, EUserState, ICreateUserDto } from "@/shared/typedefs";

import {
  CREATE_USER_EMAIL_INVALID_MESSAGE,
  CREATE_USER_EMAIL_TOO_LONG_MESSAGE,
  CREATE_USER_NAME_MIN_LENGTH,
  CREATE_USER_NAME_REQUIRED_MESSAGE,
  CREATE_USER_NAME_TOO_LONG_MESSAGE,
  CREATE_USER_PASSWORD_TOO_LONG_MESSAGE,
  CREATE_USER_PASSWORD_TOO_SHORT_MESSAGE,
} from "./CreateUserDialog.constants";
import type { TCreateUserFormFields } from "./CreateUserDialog.types";

export const createUserFormValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CREATE_USER_NAME_MIN_LENGTH, CREATE_USER_NAME_REQUIRED_MESSAGE)
    .max(USER_NAME_MAX_LENGTH, CREATE_USER_NAME_TOO_LONG_MESSAGE),
  email: z
    .string()
    .trim()
    .max(USER_EMAIL_MAX_LENGTH, CREATE_USER_EMAIL_TOO_LONG_MESSAGE)
    .email(CREATE_USER_EMAIL_INVALID_MESSAGE),
  password: z
    .string()
    .min(USER_PASSWORD_MIN_LENGTH, CREATE_USER_PASSWORD_TOO_SHORT_MESSAGE)
    .max(USER_PASSWORD_MAX_LENGTH, CREATE_USER_PASSWORD_TOO_LONG_MESSAGE),
  role: z.nativeEnum(EUserRole).refine(isAssignableUserRole, ROLE_NOT_ASSIGNABLE_MESSAGE),
  state: z.nativeEnum(EUserState),
});

export const createUserFormResolver = zodResolver(createUserFormValidationSchema);

export const createUserFormInitialValues: TCreateUserFormFields = {
  name: "",
  email: "",
  password: "",
  role: EUserRole.MENTEE,
  state: EUserState.ACTIVE,
};

export function buildCreateUserPayload(values: TCreateUserFormFields): ICreateUserDto {
  return {
    name: values.name,
    email: values.email,
    password: values.password,
    role: values.role,
    state: values.state,
  };
}
