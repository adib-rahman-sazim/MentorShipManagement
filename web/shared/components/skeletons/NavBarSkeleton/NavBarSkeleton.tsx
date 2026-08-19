import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadui/skeleton";

import { SHIMMER_ANIMATION } from "./NavBarSkeleton.constants";
import { INavBarSkeletonProps } from "./NavBarSkeleton.interfaces";

const NavBarSkeleton = ({ className }: INavBarSkeletonProps) => (
  <header
    className={cn(
      "flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3",
      className,
    )}
  >
    <div className="flex items-center gap-4">
      <Skeleton className={cn("h-9 w-9 rounded-lg md:hidden", SHIMMER_ANIMATION)} />
      <div className={cn("relative", SHIMMER_ANIMATION)}>
        <Skeleton className="h-10 w-64 lg:w-80 rounded-lg" />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Skeleton className={cn("h-9 w-9 rounded-lg", SHIMMER_ANIMATION)} />
      <Skeleton className={cn("h-9 w-9 rounded-lg", SHIMMER_ANIMATION)} />

      <div className={cn("relative ml-1", SHIMMER_ANIMATION)}>
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-background" />
      </div>

      <div
        className={cn(
          "ml-2 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5",
          SHIMMER_ANIMATION,
        )}
      >
        <Skeleton className="h-7 w-7 rounded-full" />
        <div className="hidden sm:block space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-14" />
        </div>
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  </header>
);

export default NavBarSkeleton;
