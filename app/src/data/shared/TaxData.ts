export function FormatTinNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  const formattedGroups = [
    digits.slice(0, 4),
    digits.slice(4, 8),
    digits.slice(8, 13),
  ].filter(Boolean);

  return formattedGroups.join("-");
}
