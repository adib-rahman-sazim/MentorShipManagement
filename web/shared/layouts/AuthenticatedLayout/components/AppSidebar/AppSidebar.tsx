import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { LanguageSelector } from "@/shared/components/LanguageSelector";
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

import AppSidebarUser from "./components/AppSidebarUser";
import { getVisibleSidebarMenuItems } from "./AppSidebar.helpers";

const AppSidebar = () => {
  const { isLoading, user } = useAuth();
  const { ability, isAbilityLoading } = useAbilityContext();
  const { signOut } = useSignOut();

  if (isLoading || !user || isAbilityLoading) {
    return (
      <Sidebar>
        <SidebarSkeleton />
      </Sidebar>
    );
  }

  const menuItems = getVisibleSidebarMenuItems((action, resource) =>
    canPerform(ability, action, resource),
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
        <div className="flex flex-1 w-full">
          <LanguageSelector />
        </div>
        <AppSidebarUser user={user} />
        <Button variant="destructive" onClick={() => signOut()}>
          Sign Out
          <ArrowRight />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
