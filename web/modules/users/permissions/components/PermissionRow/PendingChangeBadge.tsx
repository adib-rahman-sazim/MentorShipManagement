import { Badge } from "@/shared/components/shadui/badge";

import {
  PENDING_GRANT_CLASS_NAME,
  PENDING_GRANT_LABEL,
  PENDING_REVOKE_CLASS_NAME,
  PENDING_REVOKE_LABEL,
} from "./PermissionRow.constants";
import { IPendingChangeBadgeProps } from "./PermissionRow.interfaces";

const PendingChangeBadge = ({ isChecked }: IPendingChangeBadgeProps) => (
  <Badge
    variant="outline"
    className={isChecked ? PENDING_GRANT_CLASS_NAME : PENDING_REVOKE_CLASS_NAME}
  >
    <span className="size-1.5 rounded-full bg-current" aria-hidden />
    {isChecked ? PENDING_GRANT_LABEL : PENDING_REVOKE_LABEL}
  </Badge>
);

export default PendingChangeBadge;
