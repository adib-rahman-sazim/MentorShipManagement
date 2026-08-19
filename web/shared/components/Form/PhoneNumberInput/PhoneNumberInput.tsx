import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/shared/components/shadui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadui/select";

import { DEFAULT_PHONE_COUNTRY_ISO, PHONE_COUNTRIES } from "./PhoneNumberInput.constants";
import {
  findCountryByIso,
  formatE164,
  parsePhoneNumber,
  sanitizeNationalDigits,
} from "./PhoneNumberInput.helpers";
import { IPhoneCountry, IPhoneNumberInputProps } from "./PhoneNumberInput.interfaces";
import SelectedPhoneCountryValue from "./SelectedPhoneCountryValue";

const PhoneNumberInput = ({
  id,
  value,
  onChange,
  defaultCountryIso = DEFAULT_PHONE_COUNTRY_ISO,
  disabled,
  placeholder = "Phone number",
  className,
}: IPhoneNumberInputProps) => {
  const parsed = useMemo(
    () => parsePhoneNumber(value, defaultCountryIso),
    [value, defaultCountryIso],
  );

  // Local state so the picker remembers the user's choice even when no national
  // number has been typed yet (formatE164 of empty digits is "" — no place to
  // store the country on the form value).
  const [selectedIso, setSelectedIso] = useState<string>(parsed.iso);

  useEffect(() => {
    if (value && value.startsWith("+")) {
      setSelectedIso(parsed.iso);
    }
  }, [value, parsed.iso]);

  const selectedCountry =
    findCountryByIso(selectedIso) ??
    findCountryByIso(defaultCountryIso) ??
    (PHONE_COUNTRIES[0] as IPhoneCountry);

  const handleCountryChange = (iso: string | null) => {
    if (!iso) {
      return;
    }
    const next = findCountryByIso(iso);
    if (!next) {
      return;
    }
    setSelectedIso(iso);
    if (parsed.nationalNumber) {
      onChange(formatE164(next.dialCode, parsed.nationalNumber));
    }
  };

  const handleNumberChange = (raw: string) => {
    const digits = sanitizeNationalDigits(raw);
    onChange(digits ? formatE164(selectedCountry.dialCode, digits) : "");
  };

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <Select value={selectedIso} onValueChange={handleCountryChange} disabled={disabled}>
        <SelectTrigger className="h-10 w-32 shrink-0">
          <SelectValue renderValue={(value) => <SelectedPhoneCountryValue value={value} />} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {PHONE_COUNTRIES.map((country) => (
            <SelectItem key={country.iso} value={country.iso}>
              <span className="flex items-center gap-2">
                <span className="text-sm">{country.iso}</span>
                <span className="text-sm text-muted-foreground">+{country.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        disabled={disabled}
        placeholder={placeholder}
        value={parsed.nationalNumber}
        onChange={(event) => handleNumberChange(event.target.value)}
        className="min-w-0 flex-1"
      />
    </div>
  );
};

export default PhoneNumberInput;
