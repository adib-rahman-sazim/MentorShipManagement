import { EUserRole, EUserState } from "@/shared/typedefs";

export const USER_ROLE_LABELS: Record<EUserRole, string> = {
  [EUserRole.SUPERADMIN]: "Superadmin",
  [EUserRole.SENSEI]: "Sensei",
  [EUserRole.MENTOR]: "Mentor",
  [EUserRole.MENTEE]: "Mentee",
};

export const ASSIGNABLE_USER_ROLES: readonly EUserRole[] = [
  EUserRole.SENSEI,
  EUserRole.MENTOR,
  EUserRole.MENTEE,
];

export const ASSIGNABLE_USER_ROLE_OPTIONS = ASSIGNABLE_USER_ROLES.map((role) => ({
  value: role,
  label: USER_ROLE_LABELS[role],
}));

export const USER_STATE_LABELS: Record<EUserState, string> = {
  [EUserState.ACTIVE]: "Active",
  [EUserState.INACTIVE]: "Inactive",
};

export const USER_STATE_OPTIONS = Object.values(EUserState).map((state) => ({
  value: state,
  label: USER_STATE_LABELS[state],
}));

export const USER_NAME_MAX_LENGTH = 255;
export const USER_EMAIL_MAX_LENGTH = 254;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 128;

export const ROLE_NOT_ASSIGNABLE_MESSAGE = "Choose Sensei, Mentor or Mentee.";
