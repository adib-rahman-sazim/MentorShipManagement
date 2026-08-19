import { cn } from "@/lib/utils";

import { useRouteChangeIndicator } from "./RouteChangeIndicator.hooks";

const RouteChangeIndicator = () => {
  const { isLoading } = useRouteChangeIndicator();

  return isLoading ? (
    <>
      <div className="fixed inset-0 z-9998 bg-background/25 backdrop-blur-[1px]" />
      <div className="fixed top-0 left-0 right-0 z-9999 h-2 overflow-hidden bg-primary/20 rounded">
        <div
          className={cn(
            "h-full w-1/3 bg-primary",
            "animate-[indeterminate_1.5s_ease-in-out_infinite]",
          )}
        />
      </div>
    </>
  ) : null;
};

export default RouteChangeIndicator;
