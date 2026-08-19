export const isAllowedCheckoutRedirectUrl = (redirectUrl: string, webClientBaseUrl: string) => {
  const redirectOrigin = new URL(redirectUrl).origin;
  const webClientOrigin = new URL(webClientBaseUrl).origin;

  return redirectOrigin === webClientOrigin;
};
