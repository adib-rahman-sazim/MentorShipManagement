import { LucideIcon } from "lucide-react";

import type { TAppResource } from "@/shared/providers/AbilityProvider/AbilityProvider.types";

export type TSidebarMenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  resource: TAppResource;
};
