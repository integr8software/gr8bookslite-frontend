export function formatPercentage(value: string | number) {
  const normalizedValue = String(value).trim().replace(/%$/, "").trim();
  const numericValue = Number(normalizedValue);

  if (!normalizedValue || !Number.isFinite(numericValue)) {
    return String(value);
  }

  return `${numericValue}%`;
}

export function formatPartOfTotalPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}
