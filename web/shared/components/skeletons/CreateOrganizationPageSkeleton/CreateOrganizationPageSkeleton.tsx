import { Card, CardContent, CardHeader } from "@/shared/components/shadui/card";
import { Skeleton } from "@/shared/components/shadui/skeleton";

const CreateOrganizationPageSkeleton = () => (
  <Card className="w-full max-w-lg">
    <CardHeader className="space-y-3">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </CardContent>
  </Card>
);

export default CreateOrganizationPageSkeleton;
