export function formatMoneyNumberInput(value: string, allowNegative = false) {
	const normalizedValue = value.replace(/,/g, "");
	const isNegative = allowNegative && normalizedValue.trim().startsWith("-");
	const unsignedValue = normalizedValue.replace(/[^\d.]/g, "");

	if (!unsignedValue) {
		return isNegative ? "-" : "";
	}

	const hasDecimal = unsignedValue.includes(".");
	const [rawWholePart = "", ...decimalParts] = unsignedValue.split(".");
	const wholePart = rawWholePart.replace(/^0+(?=\d)/, "");
	const decimalPart = decimalParts.join("").slice(0, 2);
	const formattedWholePart = formatMoneyWholePart(wholePart);
	const sign = isNegative ? "-" : "";

	if (!hasDecimal) {
		return `${sign}${formattedWholePart}`;
	}

	return `${sign}${formattedWholePart || "0"}.${decimalPart}`;
}

export function parseMoneyNumberInput(value: string | number | null | undefined) {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	const normalizedValue = String(value ?? "")
		.replace(/,/g, "")
		.trim();
	const amount = Number(normalizedValue || 0);

	return Number.isFinite(amount) ? amount : 0;
}

function formatMoneyWholePart(value: string) {
	if (!value) {
		return "";
	}

	return Number(value).toLocaleString("en-US", {
		maximumFractionDigits: 0,
	});
}
