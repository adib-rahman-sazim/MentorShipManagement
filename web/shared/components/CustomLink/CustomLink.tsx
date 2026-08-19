import Link from "next/link";

import { cn } from "@/lib/utils";

import { TCustomLinkProps } from "./CustomLink.types";

const CustomLink = ({ label, className, anchorTagClassName, ...rest }: TCustomLinkProps) => (
  <Link {...rest} legacyBehavior>
    <div className={className}>
      <a
        className={cn(
          "text-black font-bold hover:underline hover:cursor-pointer",
          anchorTagClassName,
        )}
      >
        {label}
      </a>
    </div>
  </Link>
);

export default CustomLink;
