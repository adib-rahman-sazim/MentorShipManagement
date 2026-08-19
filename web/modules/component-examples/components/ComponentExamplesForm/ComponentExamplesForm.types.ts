import type {
  EComponentExamplePlan,
  EComponentExampleRole,
  EComponentExampleTag,
} from "./ComponentExamplesForm.enums";

export type TComponentExamplesFormFields = {
  fullName: string;
  email: string;
  password: string;
  bio: string;
  age: number | null;
  phone: string;
  role: EComponentExampleRole;
  tags: EComponentExampleTag[];
  acceptedTerms: boolean;
  notificationsEnabled: boolean;
  plan: EComponentExamplePlan;
  startDate: Date | null;
  satisfaction: number;
  otp: string;
};
