import PermissionRow from "@/modules/users/permissions/components/PermissionRow";
import { isPermissionChecked } from "@/modules/users/permissions/permissions.helpers";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";

import { IPermissionGroupCardProps } from "./PermissionGroupCard.interfaces";

const PermissionGroupCard = ({ group, control, access, isReadOnly }: IPermissionGroupCardProps) => (
  <Card className="gap-0 py-0">
    <CardHeader className="border-b py-4 [.border-b]:pb-4">
      <CardTitle>{group.title}</CardTitle>
      <CardDescription>{group.description}</CardDescription>
      <CardAction className="text-sm text-muted-foreground tabular-nums">
        {group.grantedCount} of {group.totalCount}
      </CardAction>
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

export default PermissionGroupCard;
