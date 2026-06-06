const ACCESS_TOKEN_KEY = "gr8booksneo.accessToken";
const REMEMBER_ME_KEY = "gr8booksneo.rememberMe";
export const AuthenticatedSessionMarker = "http-only-session";

function CanUseBrowserStorage() {
  return typeof window !== "undefined";
}

function ReadBoolean(value: string | null) {
  return value === "true";
}

function ReadAccessToken(value: string | null) {
  const token = value?.trim();

  return token ? AuthenticatedSessionMarker : null;
}

function ClearLegacyReadableAccessTokenCookie() {
  if (!CanUseBrowserStorage()) {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function SaveAccessToken(_accessToken: string, rememberMe: boolean) {
  if (!CanUseBrowserStorage()) {
    return;
  }

  void _accessToken;
  window.localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));

  if (rememberMe) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, AuthenticatedSessionMarker);
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, AuthenticatedSessionMarker);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  ClearLegacyReadableAccessTokenCookie();
}

export function SaveAccessTokenForCurrentTab(_accessToken: string) {
  if (!CanUseBrowserStorage()) {
    return;
  }

  void _accessToken;
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, AuthenticatedSessionMarker);
  ClearLegacyReadableAccessTokenCookie();
}

export function GetAccessToken() {
  if (!CanUseBrowserStorage()) {
    return null;
  }

  ClearLegacyReadableAccessTokenCookie();

  if (GetRememberMePreference()) {
    return ReadAccessToken(window.localStorage.getItem(ACCESS_TOKEN_KEY));
  }

  return ReadAccessToken(window.sessionStorage.getItem(ACCESS_TOKEN_KEY));
}

export function GetRememberMePreference() {
  if (!CanUseBrowserStorage()) {
    return false;
  }

  return ReadBoolean(window.localStorage.getItem(REMEMBER_ME_KEY));
}

export function ClearAccessToken() {
  if (!CanUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REMEMBER_ME_KEY);
  ClearLegacyReadableAccessTokenCookie();
}

export function IsClientAuthSessionMarker(accessToken: string | null | undefined) {
  return accessToken === AuthenticatedSessionMarker;
}
