export function normalizeLowercaseText(value: string) {
	return value.trim().toLowerCase();
}

export function normalizeUppercaseText(value: string) {
	return value.trim().toUpperCase();
}

export function normalizeWhitespace(value: string) {
	return value.trim().replace(/\s+/g, " ");
}
