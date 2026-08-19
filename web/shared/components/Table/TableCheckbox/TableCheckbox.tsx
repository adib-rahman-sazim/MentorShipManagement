import React from "react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/shared/components/shadui/checkbox";

const TableCheckbox = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Checkbox>) => (
  <Checkbox
    className={cn(
      "flex items-center justify-center h-4 w-4 border ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);
TableCheckbox.displayName = "TableCheckbox";

export default TableCheckbox;
