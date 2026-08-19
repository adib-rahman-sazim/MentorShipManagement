import {
  Building2,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

import {
  AI_CHAT_ROUTE,
  BILLING_ROUTE,
  DASHBOARD_ROUTE,
  DOCUMENT_VECTOR_STORE_ROUTE,
  ORGANIZATIONS_ROUTE,
  SETTINGS_ROUTE,
  USERS_ROUTE,
} from "@/shared/constants/routes.constants";
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
    title: "AI Chat",
    url: AI_CHAT_ROUTE,
    icon: MessageSquare,
    resource: EResource.AI_CHAT,
  },
  {
    title: "Document Store",
    url: DOCUMENT_VECTOR_STORE_ROUTE,
    icon: FileText,
    resource: EResource.DOCUMENT_VECTOR_STORE,
  },
  {
    title: "Users",
    url: USERS_ROUTE,
    icon: Users,
    resource: EResource.USER,
  },
  {
    title: "Organizations",
    url: ORGANIZATIONS_ROUTE,
    icon: Building2,
    resource: EResource.ORGANIZATION,
  },
  {
    title: "Billing",
    url: BILLING_ROUTE,
    icon: CreditCard,
    resource: EResource.BILLING,
  },
  {
    title: "Settings",
    url: SETTINGS_ROUTE,
    icon: Settings,
    resource: EResource.SETTINGS,
  },
];
