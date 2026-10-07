import { PropsWithChildren } from "react";

import NavigationBar from "@/shared/components/NavigationBar";

import GeneralLayoutFooter from "./components/GeneralLayoutFooter";

const GeneralLayout = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-dvh flex-col bg-background text-foreground">
    <NavigationBar />
    <main className="flex flex-1 flex-col">{children}</main>
    <GeneralLayoutFooter />
  </div>
);

export default GeneralLayout;
