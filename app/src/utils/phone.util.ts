/** Format complete local landlines without changing unsupported numbers or extensions. */
export function formatLandlineDisplay(value: string): string {
  if (!/^[\d\s()-]+$/.test(value)) return value;

  const digits = value.replace(/\D/g, "");
  if (/^02\d{8}$/.test(digits)) {
    return `(02) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (/^0[3-8]\d{8}$/.test(digits)) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

export function normalizeLandlineInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function formatLandlineInput(value: string): string {
  const digits = normalizeLandlineInput(value);
  if (!digits) return "";
  const areaLength = digits.startsWith("02") ? 2 : 3;
  if (digits.length <= areaLength) return `(${digits}`;
  const subscriber = digits.slice(areaLength);
  const split = areaLength === 2 ? 4 : 3;
  return `(${digits.slice(0, areaLength)}) ${subscriber.slice(0, split)}${subscriber.length > split ? `-${subscriber.slice(split)}` : ""}`;
}
