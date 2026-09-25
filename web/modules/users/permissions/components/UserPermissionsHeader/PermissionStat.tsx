import { cn } from "@/lib/utils";

import { IPermissionStatProps } from "./UserPermissionsHeader.interfaces";

const PermissionStat = ({ label, value, valueClassName }: IPermissionStatProps) => (
  <div className="space-y-1">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className={cn("text-xl font-semibold tabular-nums", valueClassName)}>{value}</dd>
  </div>
);

export default PermissionStat;
