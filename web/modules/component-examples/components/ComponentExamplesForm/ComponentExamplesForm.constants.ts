import {
  EComponentExamplePlan,
  EComponentExampleRole,
  EComponentExampleTag,
} from "./ComponentExamplesForm.enums";
import type { TComponentExamplesFormFields } from "./ComponentExamplesForm.types";

export const COMPONENT_EXAMPLES_FORM_ID = "component-examples-form";

export const COMPONENT_EXAMPLES_OTP_LENGTH = 6;

export const COMPONENT_EXAMPLES_OTP_SLOT_KEYS = [
  "otp-slot-0",
  "otp-slot-1",
  "otp-slot-2",
  "otp-slot-3",
  "otp-slot-4",
  "otp-slot-5",
] as const;

export const COMPONENT_EXAMPLES_E164_PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export const COMPONENT_EXAMPLES_FULL_NAME_MIN_LENGTH = 1;
export const COMPONENT_EXAMPLES_FULL_NAME_MAX_LENGTH = 100;

export const COMPONENT_EXAMPLES_EMAIL_MIN_LENGTH = 1;
export const COMPONENT_EXAMPLES_EMAIL_MAX_LENGTH = 254;

export const COMPONENT_EXAMPLES_PASSWORD_MIN_LENGTH = 8;
export const COMPONENT_EXAMPLES_PASSWORD_MAX_LENGTH = 128;

export const COMPONENT_EXAMPLES_BIO_MIN_LENGTH = 1;
export const COMPONENT_EXAMPLES_BIO_MAX_LENGTH = 500;

export const COMPONENT_EXAMPLES_PHONE_MIN_LENGTH = 8;
export const COMPONENT_EXAMPLES_PHONE_MAX_LENGTH = 16;

export const COMPONENT_EXAMPLES_SLIDER_MIN = 0;
export const COMPONENT_EXAMPLES_SLIDER_MAX = 100;

export const COMPONENT_EXAMPLES_ROLE_OPTIONS = [
  { value: EComponentExampleRole.ADMIN, label: "Admin" },
  { value: EComponentExampleRole.EDITOR, label: "Editor" },
  { value: EComponentExampleRole.VIEWER, label: "Viewer" },
] as const;

export const COMPONENT_EXAMPLES_PLAN_OPTIONS = [
  { value: EComponentExamplePlan.FREE, label: "Free" },
  { value: EComponentExamplePlan.PRO, label: "Pro" },
  { value: EComponentExamplePlan.ENTERPRISE, label: "Enterprise" },
] as const;

export const COMPONENT_EXAMPLES_TAG_OPTIONS = [
  { value: EComponentExampleTag.DESIGN, label: "Design" },
  { value: EComponentExampleTag.ENGINEERING, label: "Engineering" },
  { value: EComponentExampleTag.PRODUCT, label: "Product" },
  { value: EComponentExampleTag.MARKETING, label: "Marketing" },
] as const;

export const COMPONENT_EXAMPLES_FORM_DEFAULT_VALUES: TComponentExamplesFormFields = {
  fullName: "",
  email: "",
  password: "",
  bio: "",
  age: null,
  phone: "",
  role: EComponentExampleRole.VIEWER,
  tags: [],
  acceptedTerms: false,
  notificationsEnabled: false,
  plan: EComponentExamplePlan.FREE,
  startDate: null,
  satisfaction: 50,
  otp: "",
};
