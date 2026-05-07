const PENDING_VERIFICATION_EMAIL_KEY = "gr8bookslite.pendingVerificationEmail";

function CanUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function GetPendingVerificationEmail() {
  if (!CanUseSessionStorage()) {
    return "";
  }

  return window.sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY) ?? "";
}

export function SavePendingVerificationEmail(email: string) {
  if (!CanUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
}

export function ClearPendingVerificationEmail() {
  if (!CanUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
}
