import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { Input } from "../../shadui/input";
import { ICustomInputProps } from "./CustomInput.types";

const CustomInput = forwardRef<HTMLInputElement, ICustomInputProps>(
  ({ className, type = "text", isError, ...props }, ref) => (
    <Input
      type={type}
      className={cn(
        isError ? "border-destructive" : "",
        "placeholder:text-background-secondary-foreground invalid:border-destructive placeholder:opacity-50 bg-background-secondary",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
