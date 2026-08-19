import { forwardRef, useState } from "react";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../../shadui/button";
import { Input } from "../../shadui/input";
import { ICustomInputProps } from "../CustomInput/CustomInput.types";

const PasswordInput = forwardRef<HTMLInputElement, ICustomInputProps>(
  ({ className, isError, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const disabled = props.value === "" || props.value === undefined || props.disabled;

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn(
            isError ? "border-destructive" : "",
            "hide-password-toggle pr-10 placeholder:text-muted-foreground invalid:border-destructive placeholder:opacity-100",
            className,
          )}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent disabled:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
        >
          {showPassword && !disabled ? (
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>

        <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
