import { POST_AUTH_REDIRECT_STORAGE_KEY } from "./postAuthRedirect.constants";
import { isSafePostAuthRedirect } from "./postAuthRedirect.helpers";

export const persistPostAuthRedirect = (redirect: string): void => {
  if (typeof window === "undefined" || !isSafePostAuthRedirect(redirect)) {
    return;
  }

  window.sessionStorage.setItem(POST_AUTH_REDIRECT_STORAGE_KEY, redirect);
};

export const consumePostAuthRedirect = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const redirect = window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY);
  window.sessionStorage.removeItem(POST_AUTH_REDIRECT_STORAGE_KEY);

  if (!redirect || !isSafePostAuthRedirect(redirect)) {
    return null;
  }

  return redirect;
};
