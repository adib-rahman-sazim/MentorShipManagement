import { Badge } from "@/shared/components/shadui/badge";

import { PERMISSION_SOURCE_BADGES } from "./PermissionSourceBadge.constants";
import { IPermissionSourceBadgeProps } from "./PermissionSourceBadge.interfaces";

const PermissionSourceBadge = ({ source }: IPermissionSourceBadgeProps) => {
  const badge = PERMISSION_SOURCE_BADGES[source];

  if (!badge) {
    return null;
  }

  const Icon = badge.icon;

  return (
    <Badge variant={badge.variant} className={badge.className}>
      <Icon data-icon="inline-start" aria-hidden />
      {badge.label}
    </Badge>
  );
};

export default PermissionSourceBadge;
