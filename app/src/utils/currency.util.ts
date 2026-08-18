const CurrencyFormatters = new Map<string, Intl.NumberFormat>();
const AmountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatAmount(value: number) {
  return AmountFormatter.format(value);
}

export function formatCurrency(value: number, currencyCode = "PHP") {
  const normalizedCurrencyCode = currencyCode.trim().toUpperCase() || "PHP";
  let formatter = CurrencyFormatters.get(normalizedCurrencyCode);

  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      currency: normalizedCurrencyCode,
      style: "currency",
    });
    CurrencyFormatters.set(normalizedCurrencyCode, formatter);
  }

  return formatter.format(value);
}
