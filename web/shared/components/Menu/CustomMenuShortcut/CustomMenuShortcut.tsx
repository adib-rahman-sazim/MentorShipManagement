import { cn } from "@/lib/utils";
import { DropdownMenuShortcut } from "@/shared/components/shadui/dropdown-menu";

const CustomMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <DropdownMenuShortcut
    className={cn(
      "text-xs text-background-secondary-foreground tracking-wide opacity-100",
      className,
    )}
    {...props}
  />
);

CustomMenuShortcut.displayName = "CustomMenuShortcut";

export default CustomMenuShortcut;
