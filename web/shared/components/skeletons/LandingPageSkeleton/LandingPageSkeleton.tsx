import { Skeleton } from "@/shared/components/shadui/skeleton";

const LandingPageSkeleton = () => (
  <div className="w-full max-w-4xl px-4 space-y-6">
    <div className="space-y-3 text-center">
      <Skeleton className="h-12 w-80 mx-auto" />
      <Skeleton className="h-5 w-96 mx-auto" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  </div>
);

export default LandingPageSkeleton;
