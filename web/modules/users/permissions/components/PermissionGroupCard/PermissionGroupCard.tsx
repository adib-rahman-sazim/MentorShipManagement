import PermissionRow from "@/modules/users/permissions/components/PermissionRow";
import {
  formatGroupGrantedLabel,
  isPermissionChecked,
} from "@/modules/users/permissions/permissions.helpers";
import { Badge } from "@/shared/components/shadui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";

import { IPermissionGroupCardProps } from "./PermissionGroupCard.interfaces";

const PermissionGroupCard = ({ group, control, access, isReadOnly }: IPermissionGroupCardProps) => {
  const Icon = group.icon;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex items-center gap-3 border-b bg-muted/50 px-4 py-4 md:px-6 [.border-b]:pb-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-xs">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <CardTitle className="font-semibold">{group.title}</CardTitle>
          <CardDescription>{group.description}</CardDescription>
        </div>
        <Badge variant="outline" className="bg-background tabular-nums">
          {formatGroupGrantedLabel(group.grantedCount, group.totalCount)}
        </Badge>
      </CardHeader>
      <CardContent className="divide-y px-0 group-data-[size=sm]/card:px-0">
        {group.permissions.map((permission) => (
          <PermissionRow
            key={permission.code}
            permission={permission}
            control={control}
            isChecked={isPermissionChecked(permission, access)}
            isReadOnly={isReadOnly}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default PermissionGroupCard;
