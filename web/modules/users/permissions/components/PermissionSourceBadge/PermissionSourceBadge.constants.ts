import { Minus, Plus, ShieldCheck } from "lucide-react";

import { EPermissionSource } from "@/shared/typedefs";

import type { IPermissionSourceBadgeConfig } from "./PermissionSourceBadge.interfaces";

export const PERMISSION_SOURCE_BADGES: Partial<
  Record<EPermissionSource, IPermissionSourceBadgeConfig>
> = {
  [EPermissionSource.ROLE]: {
    label: "From role",
    icon: ShieldCheck,
    variant: "secondary",
    className: "",
  },
  [EPermissionSource.GRANTED]: {
    label: "Added",
    icon: Plus,
    variant: "outline",
    className: "border-success/30 bg-success/10 text-success",
  },
  [EPermissionSource.REVOKED]: {
    label: "Removed",
    icon: Minus,
    variant: "destructive",
    className: "",
  },
};
