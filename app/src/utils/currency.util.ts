const CurrencyFormatters = new Map<string, Intl.NumberFormat>();

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
