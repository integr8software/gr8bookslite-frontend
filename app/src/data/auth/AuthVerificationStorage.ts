const PENDING_VERIFICATION_EMAIL_KEY = "gr8bookslite.pendingVerificationEmail";
const VERIFICATION_RESEND_COOLDOWNS_KEY =
  "gr8bookslite.verificationResendCooldowns";

function CanUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function NormalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function GetStoredCooldowns() {
  if (!CanUseSessionStorage()) {
    return {} as Record<string, number>;
  }

  const rawValue = window.sessionStorage.getItem(VERIFICATION_RESEND_COOLDOWNS_KEY);

  if (!rawValue) {
    return {} as Record<string, number>;
  }

  try {
    return JSON.parse(rawValue) as Record<string, number>;
  } catch {
    return {} as Record<string, number>;
  }
}

function SaveStoredCooldowns(cooldowns: Record<string, number>) {
  if (!CanUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    VERIFICATION_RESEND_COOLDOWNS_KEY,
    JSON.stringify(cooldowns),
  );
}

export function GetPendingVerificationEmail() {
  if (!CanUseSessionStorage()) {
    return "";
  }

  return NormalizeEmail(
    window.sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY) ?? "",
  );
}

export function SavePendingVerificationEmail(email: string) {
  const normalizedEmail = NormalizeEmail(email);

  if (!normalizedEmail) {
    return;
  }

  if (!CanUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, normalizedEmail);
}

export function ClearPendingVerificationEmail() {
  if (!CanUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
}

export function GetVerificationResendSecondsRemaining(email: string) {
  const normalizedEmail = NormalizeEmail(email);

  if (!normalizedEmail) {
    return 0;
  }

  const cooldowns = GetStoredCooldowns();
  const expiresAt = cooldowns[normalizedEmail];

  if (!expiresAt) {
    return 0;
  }

  const secondsRemaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

  if (secondsRemaining === 0) {
    delete cooldowns[normalizedEmail];
    SaveStoredCooldowns(cooldowns);
  }

  return secondsRemaining;
}

export function SaveVerificationResendCooldown(email: string, seconds: number) {
  const normalizedEmail = NormalizeEmail(email);

  if (!normalizedEmail) {
    return;
  }

  const cooldowns = GetStoredCooldowns();
  cooldowns[normalizedEmail] = Date.now() + seconds * 1000;
  SaveStoredCooldowns(cooldowns);
}
