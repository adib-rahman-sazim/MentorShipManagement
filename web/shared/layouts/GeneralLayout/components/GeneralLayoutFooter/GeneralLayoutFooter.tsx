import dayjs from "dayjs";

import CustomLink from "@/shared/components/CustomLink";

const GeneralLayoutFooter = () => {
  const currentYear = dayjs().year();

  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        © {currentYear} Sazim Tech Ltd. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <CustomLink className="text-xs" href="#" label="Terms of Service" />
        <CustomLink className="text-xs" href="#" label="Privacy Policy" />
      </nav>
    </footer>
  );
};

export default GeneralLayoutFooter;
