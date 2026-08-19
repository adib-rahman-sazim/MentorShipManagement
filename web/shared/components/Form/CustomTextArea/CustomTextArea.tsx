import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { Textarea } from "../../shadui/textarea";
import { ICustomTextAreaProps } from "./CustomTextArea.types";

const CustomTextArea = forwardRef<HTMLTextAreaElement, ICustomTextAreaProps>(
  ({ className, isError, ...props }, ref) => (
    <Textarea
      className={cn(
        isError ? "border-destructive" : "",
        "placeholder:text-background-secondary-foreground invalid:border-destructive placeholder:opacity-50 border-border bg-background-secondary focus-visible:ring-1",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

CustomTextArea.displayName = "CustomTextArea";

export default CustomTextArea;
