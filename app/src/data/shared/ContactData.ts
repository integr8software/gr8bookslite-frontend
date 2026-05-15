import { PHILIPPINE_PREFIX } from "@/app/src/constants/shared/ContactConstants";

export { PHILIPPINE_PREFIX };

export const DefaultPhilippineContactNumber = `${PHILIPPINE_PREFIX}`;

export const PhilippineContactNumberPlaceholder = `${PHILIPPINE_PREFIX}`;

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
    : DefaultPhilippineContactNumber;
}

export function GetDefaultPhilippineContactNumber(value: string) {
  return value || DefaultPhilippineContactNumber;
}
