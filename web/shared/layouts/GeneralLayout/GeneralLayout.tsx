import { PropsWithChildren } from "react";

import NavigationBar from "@/shared/components/NavigationBar";

import GeneralLayoutFooter from "./components/GeneralLayoutFooter";

const GeneralLayout = ({ children }: PropsWithChildren) => (
  <div className="min-h-screen flex flex-col">
    <div className="w-full">
      <NavigationBar />
    </div>
    <main className="flex-1 flex">{children}</main>
    <GeneralLayoutFooter />
  </div>
);

export default GeneralLayout;
