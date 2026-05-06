export const OTP_LENGTH = 4;
export const OTP_RESEND_SECONDS = 300;
export const MOCK_OTP_CODE = "1234";

export function MaskEmailAddress(email: string) {
  const [localPart = "", domain = ""] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visibleLocal = localPart.slice(0, 2);
  const maskedLocal = `${visibleLocal}${"*".repeat(
    Math.max(localPart.length - visibleLocal.length, 0),
  )}`;

  return `${maskedLocal}@${domain}`;
}
