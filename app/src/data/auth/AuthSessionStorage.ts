const ACCESS_TOKEN_KEY = "gr8booksneo.accessToken";
const REMEMBER_ME_KEY = "gr8booksneo.rememberMe";

function CanUseBrowserStorage() {
  return typeof window !== "undefined";
}

function ReadBoolean(value: string | null) {
  return value === "true";
}

function ClearLegacyReadableAccessTokenCookie() {
  if (!CanUseBrowserStorage()) {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function SaveAccessToken(accessToken: string, rememberMe: boolean) {
  if (!CanUseBrowserStorage()) {
    return;
  }

  void accessToken;
  window.localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  ClearLegacyReadableAccessTokenCookie();
}

export function GetAccessToken() {
  if (!CanUseBrowserStorage()) {
    return null;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  ClearLegacyReadableAccessTokenCookie();

  return null;
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
