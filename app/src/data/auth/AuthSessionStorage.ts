const ACCESS_TOKEN_KEY = "gr8bookslite.accessToken";

function CanUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function SaveAccessToken(accessToken: string) {
  if (!CanUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function GetAccessToken() {
  if (!CanUseSessionStorage()) {
    return "";
  }

  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
}

export function ClearAccessToken() {
  if (!CanUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
