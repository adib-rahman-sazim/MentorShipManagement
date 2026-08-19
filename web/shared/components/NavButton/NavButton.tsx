import { cn } from "@/lib/utils";

import CustomButton from "../Form/CustomButton";
import { Badge } from "../shadui/badge";
import { INavButtonProps } from "./NavButton.types";

const NavButton: React.FC<INavButtonProps> = ({
  badgeValue,
  icon,
  active,
  className,
  isNested = false,
  children,
}) => (
  <CustomButton
    size="sm"
    variant="ghost"
    className={cn(
      active ? "bg-muted" : "",
      isNested ? "pl-8 h-6 my-1" : "",
      "flex justify-between items-center w-full hover:bg-muted",
      className,
    )}
  >
    <div
      className={cn(
        "flex gap-3 items-center justify-start w-full",
        isNested ? "text-background-secondary-foreground leading-4 text-xs" : "text-sm leading-5",
      )}
    >
      {icon ? icon : null}
      {children}
    </div>
    {badgeValue && Number(badgeValue) !== 0 ? (
      <Badge
        variant={"outline"}
        className={cn("px-2 bg-input h-4 rounded-xl text-xs font-light", className)}
      >
        {badgeValue}
      </Badge>
    ) : null}
  </CustomButton>
);

export default NavButton;
