import { ChangeEvent, FocusEvent, useCallback, useEffect, useState } from "react";

import { DEFAULT_ALLOW_DECIMALS } from "./NumberInput.constants";
import {
  clampValue,
  formatDisplayValue,
  isValidNumericInput,
  parseNumericValue,
} from "./NumberInput.helpers";
import { INumberInputProps } from "./NumberInput.interfaces";

export const useNumberInput = ({
  value,
  onChange,
  min,
  max,
  allowDecimals = DEFAULT_ALLOW_DECIMALS,
  onBlur: externalOnBlur,
}: Pick<INumberInputProps, "value" | "onChange" | "min" | "max" | "allowDecimals" | "onBlur">) => {
  const [internalValue, setInternalValue] = useState(() => formatDisplayValue(value));

  useEffect(() => {
    setInternalValue(formatDisplayValue(value));
  }, [value]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (!isValidNumericInput({ inputValue, allowDecimals })) {
        return;
      }

      const parsedValue = parseNumericValue({ inputValue, allowDecimals });
      if (parsedValue !== null) {
        const clampedValue = clampValue({ value: parsedValue, min, max });
        const clampedDisplay = formatDisplayValue(clampedValue);
        setInternalValue(clampedDisplay);
        onChange(clampedValue);
      } else {
        setInternalValue(inputValue);
        onChange(parsedValue);
      }
    },
    [allowDecimals, min, max, onChange],
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const parsedValue = parseNumericValue({ inputValue: internalValue, allowDecimals });

      if (parsedValue !== null) {
        const clampedValue = clampValue({ value: parsedValue, min, max });
        if (clampedValue !== parsedValue) {
          setInternalValue(formatDisplayValue(clampedValue));
          onChange(clampedValue);
        }
      }

      externalOnBlur?.(e);
    },
    [internalValue, allowDecimals, min, max, onChange, externalOnBlur],
  );

  return {
    internalValue,
    handleChange,
    handleBlur,
  };
};
