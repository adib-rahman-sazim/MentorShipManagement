import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadui/skeleton";

import {
  DEFAULT_FIELDS,
  PRIMARY_FIELD_SKELETON_KEYS,
  SECONDARY_FIELD_SKELETON_KEYS,
  SHIMMER_ANIMATION,
} from "./FormSkeleton.constants";
import { IFormSkeletonProps } from "./FormSkeleton.interfaces";

const FormSkeleton = ({
  fields = DEFAULT_FIELDS,
  showSubmitButton = false,
}: IFormSkeletonProps) => (
  <div className="w-full space-y-8">
    <div className="space-y-6">
      <div
        className={cn(
          "space-y-3 rounded-lg border border-border/50 bg-card p-5",
          SHIMMER_ANIMATION,
        )}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRIMARY_FIELD_SKELETON_KEYS.slice(0, fields).map((fieldKey) => (
            <div key={fieldKey} className="space-y-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {fields > 4 ? (
        <div
          className={cn(
            "space-y-3 rounded-lg border border-border/50 bg-card p-5",
            SHIMMER_ANIMATION,
          )}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECONDARY_FIELD_SKELETON_KEYS.slice(0, fields - 4).map((fieldKey) => (
              <div key={fieldKey} className="space-y-2">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>

    {showSubmitButton ? (
      <div className="flex items-center justify-end gap-3 pt-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    ) : null}
  </div>
);

export default FormSkeleton;
