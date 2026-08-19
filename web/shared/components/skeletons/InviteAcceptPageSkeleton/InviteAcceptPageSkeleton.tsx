import { Card, CardContent, CardHeader } from "@/shared/components/shadui/card";
import { Skeleton } from "@/shared/components/shadui/skeleton";

const InviteAcceptPageSkeleton = () => (
  <Card className="w-full max-w-lg">
    <CardHeader className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-80" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </CardContent>
  </Card>
);

export default InviteAcceptPageSkeleton;
