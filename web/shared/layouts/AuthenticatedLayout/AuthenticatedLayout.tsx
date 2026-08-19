import { PropsWithChildren } from "react";

import { SidebarProvider, SidebarTrigger } from "@/shared/components/shadui/sidebar";

import AppSidebar from "./components/AppSidebar";

const AuthenticatedLayout = ({ children }: PropsWithChildren) => (
  <SidebarProvider>
    <AppSidebar />
    <main className="flex h-screen w-full flex-col">
      <SidebarTrigger />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </main>
  </SidebarProvider>
);

export default AuthenticatedLayout;
