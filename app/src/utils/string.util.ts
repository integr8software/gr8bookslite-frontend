export function normalizeLowercaseText(value: string) {
	return value.trim().toLowerCase();
}

export function normalizeLowercaseWhitespace(value: string) {
	return normalizeWhitespace(value).toLowerCase();
}

export function normalizeUppercaseText(value: string) {
	return value.trim().toUpperCase();
}

export function normalizeCodeWithHyphens(
	value: string,
	options: { case?: "lower" | "upper" } = {},
) {
	const normalizedValue = value.trim().replace(/\s+/g, "-");

	return options.case === "lower"
		? normalizedValue.toLowerCase()
		: normalizedValue.toUpperCase();
}

export function normalizeWhitespace(value: string) {
	return value.trim().replace(/\s+/g, " ");
}
