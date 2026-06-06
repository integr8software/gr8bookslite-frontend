const ACCESS_TOKEN_KEY = "gr8booksneo.accessToken";
const REMEMBER_ME_KEY = "gr8booksneo.rememberMe";
export const AuthenticatedSessionMarker = "http-only-session";

function CanUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function ClearLegacyAuthStorage() {
  if (!CanUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REMEMBER_ME_KEY);
}

export function IsClientAuthSessionMarker(accessToken: string | null | undefined) {
  return accessToken === AuthenticatedSessionMarker;
}
