import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from "@/modules/users/users.constants";

export const CREATE_USER_DIALOG_TITLE = "Create User";
export const CREATE_USER_DIALOG_DESCRIPTION =
  "Create an account and set a password. Share the password with the person directly.";

export const CREATE_USER_NAME_LABEL = "Name";
export const CREATE_USER_NAME_PLACEHOLDER = "Full name";
export const CREATE_USER_EMAIL_LABEL = "Email";
export const CREATE_USER_EMAIL_PLACEHOLDER = "name@example.com";
export const CREATE_USER_PASSWORD_LABEL = "Password";
export const CREATE_USER_PASSWORD_PLACEHOLDER = "At least 8 characters";
export const CREATE_USER_ROLE_LABEL = "Role";
export const CREATE_USER_ROLE_PLACEHOLDER = "Select a role";
export const CREATE_USER_STATE_LABEL = "State";
export const CREATE_USER_STATE_PLACEHOLDER = "Select a state";
export const CREATE_USER_SUBMIT_LABEL = "Create User";

export const CREATE_USER_NAME_REQUIRED_MESSAGE = "Name is required.";
export const CREATE_USER_NAME_TOO_LONG_MESSAGE = `Name must be at most ${USER_NAME_MAX_LENGTH} characters.`;
export const CREATE_USER_EMAIL_INVALID_MESSAGE = "Enter a valid email address.";
export const CREATE_USER_EMAIL_TOO_LONG_MESSAGE = `Email must be at most ${USER_EMAIL_MAX_LENGTH} characters.`;
export const CREATE_USER_PASSWORD_TOO_SHORT_MESSAGE = `Password must be at least ${USER_PASSWORD_MIN_LENGTH} characters.`;
export const CREATE_USER_PASSWORD_TOO_LONG_MESSAGE = `Password must be at most ${USER_PASSWORD_MAX_LENGTH} characters.`;

export const CREATE_USER_NAME_MIN_LENGTH = 1;

export const TOAST_MESSAGE_USER_CREATED = "User created";
export const TOAST_MESSAGE_USER_CREATE_FAILED = "Failed to create user";