export interface IPhoneCountry {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface IPhoneNumberInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  defaultCountryIso?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface IParsedPhoneNumber {
  iso: string;
  dialCode: string;
  nationalNumber: string;
}
