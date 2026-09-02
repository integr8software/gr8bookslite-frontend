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

export function cleanOptional(value: string) {
	return value.trim() || undefined;
}

export function toOptionalNumber(value: string) {
	return value.trim() ? Number(value) : undefined;
}

export function joinClasses(...classes: Array<false | null | string | undefined | 0 | "">) {
	return classes.filter(Boolean).join(" ");
}

