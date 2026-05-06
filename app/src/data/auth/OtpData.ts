export const OTP_LENGTH = 4;
export const OTP_RESEND_SECONDS = 300;
export const MOCK_OTP_CODE = "1234";

export function MaskEmailAddress(email: string) {
  const [localPart = "", domain = ""] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 3) {
    // fallback for very short emails
    return `${localPart[0] || ""}${"*".repeat(localPart.length - 1)}@${domain}`;
  }

  const first = localPart.slice(0, 2);
  const last = localPart.slice(-1);
  const masked = "*".repeat(localPart.length - 3);

  return `${first}${masked}${last}@${domain}`;
}