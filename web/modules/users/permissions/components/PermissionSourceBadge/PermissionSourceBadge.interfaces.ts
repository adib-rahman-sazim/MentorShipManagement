import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import type { badgeVariants } from "@/shared/components/shadui/badge";
import { EPermissionSource } from "@/shared/typedefs";

export interface IPermissionSourceBadgeConfig {
  label: string;
  icon: LucideIcon;
  variant: VariantProps<typeof badgeVariants>["variant"];
  className: string;
}

export interface IPermissionSourceBadgeProps {
  source: EPermissionSource;
}
