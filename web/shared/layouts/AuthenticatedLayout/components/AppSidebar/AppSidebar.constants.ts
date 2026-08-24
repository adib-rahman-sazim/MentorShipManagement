import { Home, Settings, Users } from "lucide-react";

import { DASHBOARD_ROUTE, SETTINGS_ROUTE, USERS_ROUTE } from "@/shared/constants/routes.constants";
import { EResource } from "@/shared/typedefs";

import { TSidebarMenuItem } from "./AppSidebar.types";

export const SIDEBAR_MENU_ITEMS: TSidebarMenuItem[] = [
  {
    title: "Home",
    url: DASHBOARD_ROUTE,
    icon: Home,
    resource: EResource.DASHBOARD,
  },
  {
    title: "Users",
    url: USERS_ROUTE,
    icon: Users,
    resource: EResource.USER,
  },
  {
    title: "Settings",
    url: SETTINGS_ROUTE,
    icon: Settings,
    resource: EResource.SETTINGS,
  },
];