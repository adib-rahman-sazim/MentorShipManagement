import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { PUBLIC_PAGE_CONTAINER_CLASS } from "@/shared/layouts/GeneralLayout/GeneralLayout.constants";

import { COMPANY_NAME } from "./GeneralLayoutFooter.constants";

const GeneralLayoutFooter = () => {
  const currentYear = dayjs().year();

  return (
    <footer className="border-t">
      <div className={cn(PUBLIC_PAGE_CONTAINER_CLASS, "flex h-16 items-center")}>
        <p className="text-xs text-muted-foreground">
          © {currentYear} {COMPANY_NAME}
        </p>
      </div>
    </footer>
  );
};

export default GeneralLayoutFooter;
