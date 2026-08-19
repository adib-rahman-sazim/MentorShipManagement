import { LinkProps } from "next/link";

export type TCustomLinkProps = LinkProps & {
  label: string;
  className?: string;
  anchorTagClassName?: string;
};
