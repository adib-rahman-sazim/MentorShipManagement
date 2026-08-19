import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const LoadingSpinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("h-4 w-4 text-primary/60 animate-spin", className)} />
);

export default LoadingSpinner;
