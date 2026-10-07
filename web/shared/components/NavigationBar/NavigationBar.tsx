import Link from "next/link";

import { cn } from "@/lib/utils";
import AppEntryButton from "@/shared/components/AppEntryButton";
import { APP_NAME, APP_SHORT_NAME } from "@/shared/constants/app.constants";
import { HOME_ROUTE } from "@/shared/constants/routes.constants";
import { PUBLIC_PAGE_CONTAINER_CLASS } from "@/shared/layouts/GeneralLayout/GeneralLayout.constants";

const NavigationBar = () => (
  <header>
    <div className={cn(PUBLIC_PAGE_CONTAINER_CLASS, "flex h-16 items-center justify-between")}>
      <Link
        href={HOME_ROUTE}
        className="flex items-baseline gap-2.5 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="text-base font-semibold tracking-tight">{APP_SHORT_NAME}</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">{APP_NAME}</span>
      </Link>
      <AppEntryButton variant="outline" />
    </div>
  </header>
);

export default NavigationBar;
