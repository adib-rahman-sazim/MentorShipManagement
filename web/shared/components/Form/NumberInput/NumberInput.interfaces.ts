import { InputHTMLAttributes } from "react";

export interface INumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type" | "min" | "max"
  > {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  isError?: boolean;
}
