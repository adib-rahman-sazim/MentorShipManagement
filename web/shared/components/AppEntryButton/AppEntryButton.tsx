import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/components/shadui/button";
import { Skeleton } from "@/shared/components/shadui/skeleton";
import { useAuth } from "@/shared/providers/AuthProvider";

import {
  APP_ENTRY_LARGE_SKELETON_CLASS,
  APP_ENTRY_PRESS_CLASS,
  APP_ENTRY_SKELETON_CLASS,
  SIGNED_IN_ENTRY,
  SIGNED_OUT_ENTRY,
} from "./AppEntryButton.constants";
import type { TAppEntryButtonProps } from "./AppEntryButton.types";

const AppEntryButton = ({ className, size, variant }: TAppEntryButtonProps) => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Skeleton
        aria-hidden
        className={cn(
          size === "lg" ? APP_ENTRY_LARGE_SKELETON_CLASS : APP_ENTRY_SKELETON_CLASS,
          className,
        )}
      />
    );
  }

  const entry = user ? SIGNED_IN_ENTRY : SIGNED_OUT_ENTRY;

  return (
    <Link
      href={entry.href}
      className={cn(buttonVariants({ size, variant }), APP_ENTRY_PRESS_CLASS, className)}
    >
      {entry.label}
      <ArrowRight
        aria-hidden
        data-icon="inline-end"
        className="transition-transform duration-200 ease-out group-hover/entry:translate-x-0.5"
      />
    </Link>
  );
};

export default AppEntryButton;
