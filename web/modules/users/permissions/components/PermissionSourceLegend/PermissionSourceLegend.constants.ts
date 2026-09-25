import { EPermissionSource } from "@/shared/typedefs";

import type { IPermissionLegendItem } from "./PermissionSourceLegend.interfaces";

export const PERMISSION_LEGEND_ITEMS: IPermissionLegendItem[] = [
  { source: EPermissionSource.ROLE, description: "comes with their role" },
  { source: EPermissionSource.GRANTED, description: "given to this person only" },
  { source: EPermissionSource.REVOKED, description: "taken from this person only" },
];
