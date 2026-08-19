import { cn } from "@/lib/utils";

import { Input } from "../../shadui/input";
import { useNumberInput } from "./NumberInput.hooks";
import { INumberInputProps } from "./NumberInput.interfaces";

const NumberInput = ({
  value,
  onChange,
  min,
  max,
  allowDecimals,
  isError,
  onBlur,
  className,
  ...props
}: INumberInputProps) => {
  const { internalValue, handleChange, handleBlur } = useNumberInput({
    value,
    onChange,
    min,
    max,
    allowDecimals,
    onBlur,
  });

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={cn(isError ? "border-destructive" : "", className)}
      {...props}
    />
  );
};

NumberInput.displayName = "NumberInput";

export default NumberInput;
