import { Card, CardContent, CardHeader } from "@/shared/components/shadui/card";
import { Skeleton } from "@/shared/components/shadui/skeleton";

const VerifyPageSkeleton = () => (
  <Card className="w-full max-w-lg">
    <CardHeader className="space-y-3">
      <Skeleton className="h-8 w-40" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-10 w-36 rounded-lg" />
    </CardContent>
  </Card>
);

export default VerifyPageSkeleton;
