export function formatPercentage(value: string | number) {
	const normalizedValue = String(value).trim().replace(/%$/, "").trim();
	const numericValue = Number(normalizedValue);

	if (!normalizedValue || !Number.isFinite(numericValue)) {
		return String(value);
	}

	return `${numericValue}%`;
}
