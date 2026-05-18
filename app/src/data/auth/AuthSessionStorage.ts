const ACCESS_TOKEN_KEY = "gr8bookslite.accessToken";
const REMEMBER_ME_KEY = "gr8bookslite.rememberMe";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function CanUseBrowserStorage() {
  return typeof window !== "undefined";
}

function ReadBoolean(value: string | null) {
  return value === "true";
}

function WriteAccessTokenCookie(accessToken: string, rememberMe: boolean) {
  if (!CanUseBrowserStorage()) {
    return;
  }

  const encodedToken = encodeURIComponent(accessToken);
  const maxAge = rememberMe ? `; Max-Age=${THIRTY_DAYS_IN_SECONDS}` : "";
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodedToken}; Path=/; SameSite=Lax${maxAge}`;
}

function ClearAccessTokenCookie() {
  if (!CanUseBrowserStorage()) {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function SaveAccessToken(accessToken: string, rememberMe: boolean) {
  if (!CanUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));

  if (rememberMe) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  WriteAccessTokenCookie(accessToken, rememberMe);
}

export function GetAccessToken() {
  if (!CanUseBrowserStorage()) {
    return null;
  }

  const persistentToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (persistentToken) {
    return persistentToken;
  }

  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
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
  ClearAccessTokenCookie();
}
