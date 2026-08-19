import { useMemo } from "react";

import { io } from "socket.io-client";

import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "../constants/app.constants";
import { WS_BASE_URL } from "../constants/env.constants";
import { getFromLocalStorage } from "../utils/localStorage";

export const useWebsocket = ({
  path,
  shouldAuthenticate = true,
  autoConnect = false,
}: {
  path: string;
  shouldAuthenticate?: boolean;
  autoConnect?: boolean;
}) => {
  const socket = useMemo(() => {
    const accessToken = getFromLocalStorage<string>(ACCESS_TOKEN_LOCAL_STORAGE_KEY);

    return io(WS_BASE_URL ?? "", {
      autoConnect,
      transports: ["websocket"],
      path,
      auth: shouldAuthenticate
        ? {
            authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
  }, [autoConnect, path, shouldAuthenticate]);

  return socket;
};
