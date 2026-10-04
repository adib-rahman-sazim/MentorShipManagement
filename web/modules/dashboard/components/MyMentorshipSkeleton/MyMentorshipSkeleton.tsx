import { Card, CardContent, CardHeader } from "@/shared/components/shadui/card";
import { Skeleton } from "@/shared/components/shadui/skeleton";

import { PERSON_SKELETON_KEYS, SECTION_SKELETON_KEYS } from "./MyMentorshipSkeleton.constants";

const MyMentorshipSkeleton = () => (
  <div className="flex flex-col gap-6 lg:flex-row" aria-busy="true">
    {SECTION_SKELETON_KEYS.map((sectionKey) => (
      <Card key={sectionKey} className="min-w-0 lg:flex-1">
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {PERSON_SKELETON_KEYS.map((personKey) => (
            <div key={personKey} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);

export default MyMentorshipSkeleton;
