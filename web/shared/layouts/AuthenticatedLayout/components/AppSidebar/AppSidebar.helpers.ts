import { EPermission, EResource } from "@/shared/typedefs";

import { SIDEBAR_MENU_ITEMS } from "./AppSidebar.constants";
import { TSidebarMenuItem } from "./AppSidebar.types";

export const getVisibleSidebarMenuItems = (
  can: (action: EPermission, resource: EResource | "all") => boolean,
): TSidebarMenuItem[] =>
  SIDEBAR_MENU_ITEMS.filter((item) => can(EPermission.PAGE_VIEW, item.resource));
