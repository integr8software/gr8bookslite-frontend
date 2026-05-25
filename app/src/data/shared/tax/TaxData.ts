export function FormatTinNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  const formattedGroups = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 12),
  ].filter(Boolean);

  return formattedGroups.join("-");
}
