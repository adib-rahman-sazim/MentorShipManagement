export type TSignInFormFields = {
  email: string;
  password: string;
};

export type TSignInError = {
  status: number;
  message?: string;
};