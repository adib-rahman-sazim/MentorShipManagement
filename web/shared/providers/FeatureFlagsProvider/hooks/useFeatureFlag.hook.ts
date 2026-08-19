import { useCallback, useContext, useSyncExternalStore } from "react";

import { FeatureFlagsContext } from "../FeatureFlagsProvider.context";
import { FeatureFlagsNotConfiguredError } from "../FeatureFlagsProvider.errors";

export const useFeatureFlag = (flagKey: string): boolean => {
  const strategy = useContext(FeatureFlagsContext);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!strategy) {
        return () => undefined;
      }

      return strategy.subscribe(callback);
    },
    [strategy],
  );

  const getSnapshot = useCallback(() => {
    if (!strategy) {
      throw new FeatureFlagsNotConfiguredError();
    }

    return strategy.isEnabled(flagKey);
  }, [strategy, flagKey]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
