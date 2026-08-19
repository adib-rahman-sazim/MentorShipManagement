import { Card, CardContent, CardHeader } from "@/shared/components/shadui/card";
import { Skeleton } from "@/shared/components/shadui/skeleton";

const AuthFormPageSkeleton = () => (
  <div className="w-full flex justify-center px-4">
    <Card className="w-full max-w-104 rounded-2xl py-8 shadow-sm ring-1 ring-gray-200/70">
      <CardHeader className="px-10 pb-6 space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="px-10 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  </div>
);

export default AuthFormPageSkeleton;
