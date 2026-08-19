import { cn } from "@/lib/utils";
import { DropdownMenuContent } from "@/shared/components/shadui/dropdown-menu";

const CustomMenuContent = ({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuContent>) => (
  <DropdownMenuContent
    sideOffset={sideOffset}
    className={cn(
      className,
      "border-border bg-background-secondary text-background-foreground shadow-md",
    )}
    {...props}
  />
);
CustomMenuContent.displayName = "CustomMenuContent";

export default CustomMenuContent;
