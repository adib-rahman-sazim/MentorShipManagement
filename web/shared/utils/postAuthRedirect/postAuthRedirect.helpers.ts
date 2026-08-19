export const isSafePostAuthRedirect = (redirect: string): boolean => {
  if (!redirect.startsWith("/")) {
    return false;
  }

  if (redirect.startsWith("//")) {
    return false;
  }

  return true;
};
