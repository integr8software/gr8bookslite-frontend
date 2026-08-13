export function formatExchangeRateInput(value: string) {
  const normalizedValue = value.replace(/,/g, "");
  const numericValue = normalizedValue.replace(/[^\d.]/g, "");

  if (!numericValue) {
    return "";
  }

  const [wholePart = "", ...decimalParts] = numericValue.split(".");
  const decimalPart = decimalParts.join("");
  const normalizedWholePart = wholePart.replace(/^0+(?=\d)/, "");

  if (!numericValue.includes(".")) {
    return normalizedWholePart;
  }

  return `${normalizedWholePart || "0"}.${decimalPart}`;
}

export function parseAmount(value: string) {
  if (!value.trim()) {
    return null;
  }

  const amount = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : null;
}
