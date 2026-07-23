import {
	createBlankPickListLineEntry,
	pickListEntryHasData,
	pickListEntryIsComplete,
} from "@/app/src/data/modules/inventory/pick-list/PickListData";
import type { PickListLineEntry } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function createPickListLineEntries(count: number) {
	return Array.from({ length: count }, () => createBlankPickListLineEntry());
}

export function clearPickListLines(
	rows: PickListLineEntry[],
	action: ModuleDataEntryClearAction,
) {
	if (action === "all") {
		return [createBlankPickListLineEntry()];
	}

	const nextRows = rows.filter((row) => !shouldClearPickListLine(row, action));

	return nextRows.length > 0 ? nextRows : [createBlankPickListLineEntry()];
}

export function duplicatePickListLine(
	rows: PickListLineEntry[],
	rowId: string,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createBlankPickListLineEntry().id,
	});

	return nextRows;
}

export function insertPickListLine(
	rows: PickListLineEntry[],
	rowId: string,
	position: "above" | "below",
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createBlankPickListLineEntry(),
	);

	return nextRows;
}

export function movePickListLine(
	rows: PickListLineEntry[],
	fromRowId: string,
	toRowId: string,
) {
	const fromIndex = rows.findIndex((row) => row.id === fromRowId);
	const toIndex = rows.findIndex((row) => row.id === toRowId);

	if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
		return rows;
	}

	const nextRows = [...rows];
	const [movedRow] = nextRows.splice(fromIndex, 1);

	if (!movedRow) {
		return rows;
	}

	nextRows.splice(toIndex, 0, movedRow);

	return nextRows;
}

export function removePickListLine(
	rows: PickListLineEntry[],
	rowId: string,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);

	return nextRows.length > 0 ? nextRows : [createBlankPickListLineEntry()];
}

function shouldClearPickListLine(
	entry: PickListLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return pickListEntryHasData(entry);
	}

	if (action === "incomplete") {
		return pickListEntryHasData(entry) && !pickListEntryIsComplete(entry);
	}

	return !pickListEntryHasData(entry);
}
