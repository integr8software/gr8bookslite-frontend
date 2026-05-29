export type BranchDisplaySource = {
	isMain?: boolean;
	name: string;
};

export function getBranchDisplayLabel(branch: BranchDisplaySource) {
	if (!branch.isMain) {
		return branch.name.trim();
	}

	const baseName = stripHeadOfficeLabel(branch.name);

	return [baseName, "(Head Office)"].filter(Boolean).join(" ");
}

export function stripHeadOfficeLabel(value: string) {
	let nextValue = value.trim();
	let previousValue = "";

	while (nextValue && nextValue !== previousValue) {
		previousValue = nextValue;
		nextValue = nextValue
			.replace(/\s*(?:\(\s*head office\s*\)|head office)\s*$/i, "")
			.trim();
	}

	return nextValue;
}
