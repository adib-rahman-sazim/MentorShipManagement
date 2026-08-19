import {
  DEFAULT_PHONE_COUNTRY_ISO,
  MAX_PHONE_NATIONAL_DIGITS,
  MIN_PHONE_NATIONAL_DIGITS,
  PHONE_COUNTRIES,
} from "./PhoneNumberInput.constants";
import { IParsedPhoneNumber, IPhoneCountry } from "./PhoneNumberInput.interfaces";

export const findCountryByIso = (iso: string): IPhoneCountry | undefined =>
  PHONE_COUNTRIES.find((c) => c.iso === iso);

export const sanitizeNationalDigits = (input: string): string => input.replace(/\D/g, "");

const resolveFallbackCountry = (iso: string): IPhoneCountry =>
  findCountryByIso(iso) ?? PHONE_COUNTRIES[0]!;

export const parsePhoneNumber = (
  value: string,
  fallbackIso: string = DEFAULT_PHONE_COUNTRY_ISO,
): IParsedPhoneNumber => {
  if (!value.startsWith("+")) {
    const fallback = resolveFallbackCountry(fallbackIso);
    return {
      iso: fallback.iso,
      dialCode: fallback.dialCode,
      nationalNumber: sanitizeNationalDigits(value),
    };
  }

  const digits = value.slice(1).replace(/\D/g, "");
  // Match the longest matching dial code prefix to disambiguate overlapping codes.
  const sortedCountries = [...PHONE_COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );
  const matched = sortedCountries.find((c) => digits.startsWith(c.dialCode));

  if (matched) {
    return {
      iso: matched.iso,
      dialCode: matched.dialCode,
      nationalNumber: digits.slice(matched.dialCode.length),
    };
  }

  const fallback = resolveFallbackCountry(fallbackIso);
  return { iso: fallback.iso, dialCode: fallback.dialCode, nationalNumber: digits };
};

export const formatE164 = (dialCode: string, nationalNumber: string): string => {
  const digits = sanitizeNationalDigits(nationalNumber);
  if (!digits) {
    return "";
  }
  return `+${dialCode}${digits}`;
};

export const isValidPhoneNumber = (value: string): boolean => {
  if (!value.startsWith("+")) {
    return false;
  }
  const { nationalNumber } = parsePhoneNumber(value);
  return (
    nationalNumber.length >= MIN_PHONE_NATIONAL_DIGITS &&
    nationalNumber.length <= MAX_PHONE_NATIONAL_DIGITS
  );
};
