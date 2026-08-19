import { PropsWithChildren } from "react";

import { useLanguageDirection } from "@/shared/hooks/useLanguageDirection";
import { useSubscribeToLanguageStorageEvents } from "@/shared/hooks/useSubscribeToLanguageStorageEvents";

const AppInitializer = ({ children }: PropsWithChildren) => {
  useLanguageDirection();
  useSubscribeToLanguageStorageEvents();

  return <>{children}</>;
};

export default AppInitializer;
