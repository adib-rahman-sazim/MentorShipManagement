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
        "flex items-start justify-between gap-4 border-l-4 px-4 py-4 transition-colors md:px-6",
        isPending ? "border-l-primary bg-muted/60" : "border-l-transparent",
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium">{details.label}</p>
        <p className="text-sm break-words text-muted-foreground">{details.description}</p>
      </div>

      <div className="flex shrink-0 flex-col-reverse items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
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
