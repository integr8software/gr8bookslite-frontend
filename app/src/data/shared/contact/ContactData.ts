import { PHILIPPINE_PREFIX } from "@/app/src/constants/shared/contact/ContactConstants";

export { PHILIPPINE_PREFIX };

export const DefaultPhilippineContactNumber = `${PHILIPPINE_PREFIX} `;

export const PhilippineContactNumberPlaceholder = DefaultPhilippineContactNumber;

function IsEmptyOrPartialPhilippinePrefix(value: string) {
  const trimmedValue = value.trim();

  return (
    trimmedValue === "" ||
    trimmedValue === "+" ||
    trimmedValue === "+6" ||
    trimmedValue === PHILIPPINE_PREFIX
  );
}

export function FormatPhilippineContactNumber(value: string) {
  if (IsEmptyOrPartialPhilippinePrefix(value)) {
    return DefaultPhilippineContactNumber;
  }

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
