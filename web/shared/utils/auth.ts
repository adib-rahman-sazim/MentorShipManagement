import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";

export const getAuthToken = (): string => {
  if (typeof globalThis.window === "undefined") {
    return "";
  }
  return localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY) || "";
};
