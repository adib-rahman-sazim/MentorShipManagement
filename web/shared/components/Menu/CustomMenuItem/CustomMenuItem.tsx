import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/shared/components/shadui/dropdown-menu";

const CustomMenuItem = ({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
  inset?: boolean;
}) => (
  <DropdownMenuItem
    className={cn(
      inset && "pl-8",
      className,
      "rounded-md focus:bg-muted focus:text-background-foreground",
    )}
    {...props}
  />
);
CustomMenuItem.displayName = "CustomMenuItem";

export default CustomMenuItem;
