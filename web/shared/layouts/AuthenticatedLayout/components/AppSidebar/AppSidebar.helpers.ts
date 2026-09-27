import type { TCanCheck } from "@/shared/providers/AbilityProvider/AbilityProvider.types";
import { EPermission } from "@/shared/typedefs";

import { SIDEBAR_MENU_ITEMS } from "./AppSidebar.constants";
import { TSidebarMenuItem } from "./AppSidebar.types";

export function getVisibleSidebarMenuItems(can: TCanCheck): TSidebarMenuItem[] {
  return SIDEBAR_MENU_ITEMS.filter((item) => can(EPermission.PAGE_VIEW, item.resource));
}
