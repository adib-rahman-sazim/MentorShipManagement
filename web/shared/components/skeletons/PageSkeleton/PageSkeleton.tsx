import { cn } from "@/lib/utils";
import { Sidebar, SidebarProvider } from "@/shared/components/shadui/sidebar";
import { Skeleton } from "@/shared/components/shadui/skeleton";
import NavBarSkeleton from "@/shared/components/skeletons/NavBarSkeleton";
import SidebarSkeleton from "@/shared/components/skeletons/SidebarSkeleton";

import {
  ACTIVITY_SKELETON_KEYS,
  SHIMMER_ANIMATION,
  STAT_CARD_SKELETON_KEYS,
  TABLE_ROW_SKELETON_KEYS,
} from "./PageSkeleton.constants";
import { IPageSkeletonProps } from "./PageSkeleton.interfaces";

const PageSkeleton = ({ className }: IPageSkeletonProps) => (
  <SidebarProvider className="h-screen">
    <Sidebar className="border-r border-border">
      <SidebarSkeleton />
    </Sidebar>
    <main className="flex-1 flex flex-col overflow-auto">
      <NavBarSkeleton />
      <div className={cn("flex-1 p-6 space-y-6", className)}>
        <div className={cn("space-y-2", SHIMMER_ANIMATION)}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", SHIMMER_ANIMATION)}>
          {STAT_CARD_SKELETON_KEYS.map((skeletonKey) => (
            <div
              key={skeletonKey}
              className="rounded-lg border border-border/60 bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="mt-3 flex items-center gap-1">
                <Skeleton className="h-2 w-8" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          ))}
        </div>

        <div className={cn("grid gap-6 lg:grid-cols-3", SHIMMER_ANIMATION)}>
          <div className="lg:col-span-2 rounded-lg border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <div className="space-y-3">
              {TABLE_ROW_SKELETON_KEYS.map((skeletonKey) => (
                <div
                  key={skeletonKey}
                  className="flex items-center gap-4 rounded-md bg-muted/30 p-3"
                >
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
            <Skeleton className="h-5 w-28 mb-4" />
            <div className="space-y-3">
              {ACTIVITY_SKELETON_KEYS.map((skeletonKey) => (
                <div key={skeletonKey} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  </SidebarProvider>
);

export default PageSkeleton;
