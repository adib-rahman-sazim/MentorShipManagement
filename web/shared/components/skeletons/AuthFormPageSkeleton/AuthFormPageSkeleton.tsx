import { Skeleton } from "@/shared/components/shadui/skeleton";

const AuthFormPageSkeleton = () => (
  <section className="w-full max-w-[24rem]">
    <div className="mb-8 flex flex-col gap-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-56" />
    </div>

    <div className="flex flex-col gap-5">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  </section>
);

export default AuthFormPageSkeleton;