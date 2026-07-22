export function normalizeAtcCode(value: string) {
	const compactCode = value.trim().toUpperCase().replace(/\s+/g, "");

	if (/^MC\d{3}$/.test(compactCode)) {
		return compactCode;
	}

	return compactCode.replace(/^([A-Z]{2})(\d{3})$/, "$1 $2");
}

export function formatAtcDisplayCode(value: string) {
	const compactCode = normalizeAtcCode(value).replace(/\s+/g, "");

	return compactCode.replace(/^([A-Z]{2})0+(\d+)$/, "$1$2");
}

export function isAtcCodeLike(value: string) {
	const compactCode = value.trim().toUpperCase().replace(/\s+/g, "");

	return /^(W[BCIV]\d{3}|MC\d{3})$/.test(compactCode);
}

export function getAtcPartyClassification(code: string) {
	const normalizedCode = normalizeAtcCode(code);

	if (normalizedCode.startsWith("WI ")) {
		return "individual";
	}

	if (normalizedCode.startsWith("WC ")) {
		return "nonIndividual";
	}

	return "shared";
}
