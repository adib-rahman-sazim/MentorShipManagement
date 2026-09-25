import PermissionSourceBadge from "@/modules/users/permissions/components/PermissionSourceBadge";

import { PERMISSION_LEGEND_ITEMS } from "./PermissionSourceLegend.constants";

const PermissionSourceLegend = () => (
  <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
    {PERMISSION_LEGEND_ITEMS.map((item) => (
      <li key={item.source} className="flex items-center gap-1.5">
        <PermissionSourceBadge source={item.source} />
        {item.description}
      </li>
    ))}
  </ul>
);

export default PermissionSourceLegend;
