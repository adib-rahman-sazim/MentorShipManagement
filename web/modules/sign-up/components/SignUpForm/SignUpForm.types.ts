export type TSignUpFormFields = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

export type TUseSignUpFormOptions = {
  onEmailSent?: (email: string) => void;
};

export type TSignUpFormProps = {
  onEmailSent?: (email: string) => void;
};
