import { LucideIcon } from "lucide-react";

import { EResource } from "@/shared/typedefs";

export type TSidebarMenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  resource: EResource;
};
