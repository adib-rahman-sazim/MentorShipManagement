import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { Checkbox } from "../../shadui/checkbox";
import type { TCheckBoxInputProps } from "./CheckBoxInput.types";

const CheckBoxInput = forwardRef<HTMLButtonElement, TCheckBoxInputProps>(
  ({ className, ...props }, ref) => (
    <Checkbox
      className={cn("rounded-[2px] border-input", className)}
      {...props}
      {...(ref as React.Ref<HTMLButtonElement>)}
    />
  ),
);

CheckBoxInput.displayName = "CheckBoxInput";

export default CheckBoxInput;
