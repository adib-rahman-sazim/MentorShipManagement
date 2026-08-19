import { FileText } from "lucide-react";

import { Skeleton } from "@/shared/components/shadui/skeleton";

import { TQueryDocumentResultsProps } from "./QueryDocumentResults.types";

const QueryDocumentResults = ({ results, isLoading, hasSearched }: TQueryDocumentResultsProps) => {
  if (isLoading) {
    return (
      <div className="mt-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  if (results.length === 0) {
    return <p className="text-muted-foreground text-sm mt-4">No results found.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-medium text-muted-foreground">Results ({results.length})</h3>
      {results.map((result) => (
        <div
          key={`${result.fileId}-${result.score}-${result.content}`}
          className="border rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm">{result.filename}</span>
            </div>
            <span className="text-sm text-muted-foreground shrink-0">
              Score: {(result.score ?? 0).toFixed(4)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{result.content}</p>
        </div>
      ))}
    </div>
  );
};

export default QueryDocumentResults;
