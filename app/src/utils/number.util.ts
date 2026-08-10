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
