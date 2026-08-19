import { ALLOWED_DECIMAL_PATTERN, ALLOWED_INTEGER_PATTERN } from "./NumberInput.constants";
import { TClampValueParams, TParseInputParams } from "./NumberInput.types";

export const clampValue = ({ value, min, max }: TClampValueParams): number => {
  let result = value;
  if (min !== undefined && result < min) {
    result = min;
  }
  if (max !== undefined && result > max) {
    result = max;
  }
  return result;
};

export const isValidNumericInput = ({ inputValue, allowDecimals }: TParseInputParams): boolean => {
  if (inputValue === "" || inputValue === "-") {
    return true;
  }
  const pattern = allowDecimals ? ALLOWED_DECIMAL_PATTERN : ALLOWED_INTEGER_PATTERN;
  return pattern.test(inputValue);
};

export const parseNumericValue = ({
  inputValue,
  allowDecimals,
}: TParseInputParams): number | null => {
  if (inputValue === "" || inputValue === "-") {
    return null;
  }
  const parsed = allowDecimals ? parseFloat(inputValue) : parseInt(inputValue, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const formatDisplayValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};
