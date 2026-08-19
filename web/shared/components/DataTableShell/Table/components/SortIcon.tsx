import type { SortDirection } from "@tanstack/react-table";

import { ESortDirection } from "@/shared/typedefs";

export const SortIcon = ({ direction }: { direction: SortDirection | false }) => {
  if (direction === ESortDirection.ASC) {
    return (
      <span className="ml-2 inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-slate-500" />
    );
  }
  if (direction === ESortDirection.DESC) {
    return (
      <span className="ml-2 inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500" />
    );
  }
  return (
    <span className="ml-2 inline-flex flex-col gap-2 opacity-30">
      <span className="inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-slate-500" />
      <span className="inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500" />
    </span>
  );
};
