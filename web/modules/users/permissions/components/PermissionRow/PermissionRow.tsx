import { cn } from "@/lib/utils";
import PermissionSourceBadge from "@/modules/users/permissions/components/PermissionSourceBadge";
import { PERMISSION_DETAILS } from "@/modules/users/permissions/permissions.constants";
import { FormControl, FormField, FormItem } from "@/shared/components/shadui/form";
import { Switch } from "@/shared/components/shadui/switch";

import PendingChangeBadge from "./PendingChangeBadge";
import { IPermissionRowProps } from "./PermissionRow.interfaces";

const PermissionRow = ({ permission, control, isChecked, isReadOnly }: IPermissionRowProps) => {
  const details = PERMISSION_DETAILS[permission.code];
  const isPending = isChecked !== permission.effective;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-l-4 py-3.5 pr-4 pl-3 transition-colors md:pr-6 md:pl-5",
        isPending ? "border-l-primary bg-muted/60" : "border-l-transparent",
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm leading-5 font-medium text-foreground">{details.label}</p>
        <p className="text-sm leading-5 break-words text-muted-foreground">{details.description}</p>
      </div>

      <div className="flex shrink-0 flex-col-reverse items-end gap-2 sm:h-5 sm:flex-row sm:items-center sm:gap-4">
        {isPending ? (
          <PendingChangeBadge isChecked={isChecked} />
        ) : (
          <PermissionSourceBadge source={permission.source} />
        )}
        {isReadOnly ? null : (
          <FormField
            control={control}
            name={`access.${permission.code}`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value ?? permission.effective}
                    onCheckedChange={field.onChange}
                    aria-label={details.label}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default PermissionRow;
