import { Badge } from "@/shared/components/shadui/badge";

import { PENDING_GRANT_LABEL, PENDING_REVOKE_LABEL } from "./PermissionRow.constants";
import { IPendingChangeBadgeProps } from "./PermissionRow.interfaces";

const PendingChangeBadge = ({ isChecked }: IPendingChangeBadgeProps) => (
  <Badge variant="outline">
    <span className="size-1.5 rounded-full bg-primary" aria-hidden />
    {isChecked ? PENDING_GRANT_LABEL : PENDING_REVOKE_LABEL}
  </Badge>
);

export default PendingChangeBadge;
