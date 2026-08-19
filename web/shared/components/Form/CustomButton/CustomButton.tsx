import React, { type FC } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../../shadui/button";
import { buttonVariants, ICustomButtonProps } from "./CustomButton.types";

const CustomButton: FC<ICustomButtonProps> = ({
  children,
  disabled = false,
  variant,
  ...props
}) => (
  <Button
    variant={variant}
    className={cn(buttonVariants({ variant, className: "w-full font-normal rounded-lg" }))}
    disabled={disabled}
    {...props}
  >
    {children}
  </Button>
);

export default CustomButton;
