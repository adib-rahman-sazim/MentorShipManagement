import { Card, CardContent, CardHeader } from "@/shared/components/shadui/card";
import { Skeleton } from "@/shared/components/shadui/skeleton";

const SystemInvitePageSkeleton = () => (
  <Card className="w-full max-w-lg">
    <CardHeader>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-5 w-72" />
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-4 w-64" />
      <div className="flex flex-col gap-3 pt-2">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

export default SystemInvitePageSkeleton;
