import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadui/skeleton";

import {
  MAIN_MENU_SKELETON_ITEMS,
  SHIMMER_ANIMATION,
  SUB_MENU_SKELETON_KEYS,
} from "./SidebarSkeleton.constants";

const SidebarSkeleton = () => (
  <div className="flex h-full w-full flex-col">
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border/40 px-4 py-5",
        SHIMMER_ANIMATION,
      )}
    >
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-3 py-4">
      <div className={cn("space-y-1 mb-6", SHIMMER_ANIMATION)}>
        <Skeleton className="h-3 w-12 px-3 py-2" />
        {MAIN_MENU_SKELETON_ITEMS.map((item) => (
          <div
            key={item.key}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              item.isActive && "bg-muted/60",
            )}
          >
            <Skeleton className={cn("h-5 w-5 rounded-md", item.isActive && "bg-primary/20")} />
            <Skeleton className="h-4 flex-1" />
            {item.isActive ? <Skeleton className="h-5 w-5 rounded-full" /> : null}
          </div>
        ))}
      </div>

      <div className={cn("space-y-1", SHIMMER_ANIMATION)}>
        <Skeleton className="h-3 w-12 px-3 py-2" />
        {SUB_MENU_SKELETON_KEYS.map((skeletonKey) => (
          <div key={skeletonKey} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>

    <div className={cn("border-t border-border/40 px-3 py-4", SHIMMER_ANIMATION)}>
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  </div>
);

export default SidebarSkeleton;
