import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadui/skeleton";

import {
  GROUP_SKELETON_KEYS,
  ROW_SKELETON_KEYS,
  SHIMMER_ANIMATION,
  STAT_SKELETON_KEYS,
} from "./UserPermissionsSkeleton.constants";

const UserPermissionsSkeleton = () => (
  <div className={cn("mx-auto w-full max-w-4xl space-y-6 px-4 py-6 md:px-8", SHIMMER_ANIMATION)}>
    <div className="space-y-3">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>

    <div className="flex flex-col gap-6 rounded-xl border p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 md:gap-10">
        {STAT_SKELETON_KEYS.map((skeletonKey) => (
          <div key={skeletonKey} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-10" />
          </div>
        ))}
      </div>
    </div>

    {GROUP_SKELETON_KEYS.map((groupKey) => (
      <div key={groupKey} className="rounded-xl border">
        <div className="space-y-2 border-b p-4 md:px-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <div className="divide-y">
          {ROW_SKELETON_KEYS.map((rowKey) => (
            <div key={rowKey} className="flex items-center justify-between gap-4 p-4 md:px-6">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default UserPermissionsSkeleton;
