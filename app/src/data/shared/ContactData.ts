export const PHILIPPINE_PREFIX = "+63";

export function FormatPhilippineContactNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("63")
    ? digits.slice(2)
    : digits;
  const mobileDigits = withoutCountryCode.slice(0, 10);
  const formattedGroups = [
    mobileDigits.slice(0, 3),
    mobileDigits.slice(3, 6),
    mobileDigits.slice(6, 10),
  ].filter(Boolean);

  return formattedGroups.length
    ? `${PHILIPPINE_PREFIX} ${formattedGroups.join(" ")}`
    : `${PHILIPPINE_PREFIX} `;
}
