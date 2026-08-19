import { PHONE_COUNTRIES } from "./PhoneNumberInput.constants";
import { IPhoneCountry } from "./PhoneNumberInput.interfaces";
import { ISelectedPhoneCountryValueProps } from "./SelectedPhoneCountryValue.interfaces";

const SelectedPhoneCountryValue = ({ value }: ISelectedPhoneCountryValueProps) => {
  const country =
    PHONE_COUNTRIES.find((candidate) => candidate.iso === value) ??
    (PHONE_COUNTRIES[0] as IPhoneCountry);

  return (
    <span className="flex items-center gap-1.5">
      <span className="text-sm">{country.iso}</span>
      <span className="text-sm text-muted-foreground">+{country.dialCode}</span>
    </span>
  );
};

export default SelectedPhoneCountryValue;
