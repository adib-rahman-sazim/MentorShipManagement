import { SidebarProvider, SidebarTrigger } from "@/shared/components/shadui/sidebar";

import { IAuthenticatedLayoutProps } from "./AuthenticatedLayout.interfaces";
import AppSidebar from "./components/AppSidebar";

const AuthenticatedLayout = ({
  children,
  showSidebarTrigger = true,
}: IAuthenticatedLayoutProps) => (
  <SidebarProvider>
    <AppSidebar />
    <main className="flex h-screen w-full flex-col">
      {showSidebarTrigger ? <SidebarTrigger /> : null}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </main>
  </SidebarProvider>
);

export default AuthenticatedLayout;
