/** Returns the canonical option value when the input matches an allowed option. */
export function getModuleImportOptionValue(
	value: unknown,
	options: readonly string[],
) {
	if (typeof value !== "string") return undefined;
	const normalized = value.trim().toLocaleLowerCase();
	return options.find(
		(option) => option.trim().toLocaleLowerCase() === normalized,
	);
}

export function isModuleImportOptionValue(
	value: unknown,
	options: readonly string[],
) {
	return getModuleImportOptionValue(value, options) !== undefined;
}

export function reorderModuleImportRows<TRow extends { id: string }>(
	rows: TRow[],
	sourceRowId: string,
	targetRowId: string,
	position: "before" | "after",
) {
	const sourceIndex = rows.findIndex((row) => row.id === sourceRowId);
	const targetIndex = rows.findIndex((row) => row.id === targetRowId);

	if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
		return rows;
	}

	const nextRows = [...rows];
	const [sourceRow] = nextRows.splice(sourceIndex, 1);
	const adjustedTargetIndex = nextRows.findIndex((row) => row.id === targetRowId);
	const insertionIndex = adjustedTargetIndex + (position === "after" ? 1 : 0);

	nextRows.splice(insertionIndex, 0, sourceRow);
	return nextRows;
}
