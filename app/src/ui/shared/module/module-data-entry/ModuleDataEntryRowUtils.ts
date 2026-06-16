import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function appendModuleDataEntryRows<TRow>(
	rows: TRow[],
	createRow: () => TRow,
	count = 1,
) {
	return [...rows, ...Array.from({ length: count }, createRow)];
}

export function insertModuleDataEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	position: "above" | "below",
	createRow: () => TRow,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const insertIndex =
		rowIndex === -1 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
	const nextRows = [...rows];

	nextRows.splice(insertIndex, 0, createRow());
	return nextRows;
}

export function duplicateModuleDataEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	createId: () => string,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const sourceRow = rows[rowIndex];

	if (!sourceRow) {
		return rows;
	}

	const nextRows = [...rows];

	nextRows.splice(rowIndex + 1, 0, {
		...sourceRow,
		id: createId(),
	});

	return nextRows;
}

export function moveModuleDataEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	fromRowId: string,
	toRowId: string,
) {
	if (fromRowId === toRowId) {
		return rows;
	}

	const fromIndex = rows.findIndex((row) => row.id === fromRowId);
	const toIndex = rows.findIndex((row) => row.id === toRowId);

	if (fromIndex === -1 || toIndex === -1) {
		return rows;
	}

	const nextRows = [...rows];
	const [movedRow] = nextRows.splice(fromIndex, 1);

	nextRows.splice(toIndex, 0, movedRow);
	return nextRows;
}

export function removeModuleDataEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	options: {
		keepAtLeastOne?: boolean;
	},
) {
	if (options.keepAtLeastOne && rows.length <= 1) {
		return rows;
	}

	return rows.filter((row) => row.id !== rowId);
}

export function clearModuleDataEntryRows<TRow>(
	rows: TRow[],
	action: ModuleDataEntryClearAction,
	shouldClearRow: (
		row: TRow,
		action: Exclude<ModuleDataEntryClearAction, "all">,
	) => boolean,
	createFallbackRow: () => TRow,
) {
	const nextRows =
		action === "all"
			? []
			: rows.filter((row) => !shouldClearRow(row, action));

	return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

export function pasteModuleDataEntryRows<TRow extends { id: string }>(
	rows: TRow[],
	startRowId: string,
	updates: Partial<TRow>[],
	createRow: () => TRow,
) {
	const startIndex = rows.findIndex((row) => row.id === startRowId);
	const resolvedStartIndex = startIndex === -1 ? rows.length : startIndex;
	const nextRows = [...rows];

	updates.forEach((update, rowOffset) => {
		const rowIndex = resolvedStartIndex + rowOffset;
		const currentRow = nextRows[rowIndex] ?? createRow();

		nextRows[rowIndex] = {
			...currentRow,
			...update,
			id: currentRow.id,
		};
	});

	return nextRows;
}
