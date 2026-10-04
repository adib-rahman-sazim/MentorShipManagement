import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/shadui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/shadui/sidebar";
import SidebarSkeleton from "@/shared/components/skeletons/SidebarSkeleton";
import { useSignOut } from "@/shared/hooks/useSignOut";
import { canPerform, useAbilityContext } from "@/shared/providers/AbilityProvider";
import { useAuth } from "@/shared/providers/AuthProvider";

import { SIGN_OUT_LABEL } from "./AppSidebar.constants";
import { getVisibleSidebarMenuItems } from "./AppSidebar.helpers";
import AppSidebarUser from "./components/AppSidebarUser";

const AppSidebar = () => {
  const { isLoading, user } = useAuth();
  const { ability, isAbilityLoading } = useAbilityContext();
  const { signOut } = useSignOut();

  if (isLoading || !user || isAbilityLoading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarSkeleton />
      </Sidebar>
    );
  }

  const menuItems = getVisibleSidebarMenuItems((action, resource) =>
    canPerform(ability, action, resource),
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mentorship Management System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser user={user} />
        <Button
          variant="destructive"
          className="group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
          aria-label={SIGN_OUT_LABEL}
          onClick={() => signOut()}
        >
          <span className="group-data-[collapsible=icon]:hidden">{SIGN_OUT_LABEL}</span>
          <ArrowRight />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
