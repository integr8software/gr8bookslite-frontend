import {
	createBlankDeliveryReceiptAccountingEntry,
	createBlankDeliveryReceiptLineEntry,
	deliveryReceiptEntryHasData,
	deliveryReceiptEntryIsComplete,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type {
	DeliveryReceiptAccountingEntry,
	DeliveryReceiptLineEntry,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function createDeliveryReceiptLineEntries(count: number) {
	return Array.from({ length: count }, () =>
		createBlankDeliveryReceiptLineEntry(),
	);
}

export function createDeliveryReceiptAccountingEntryRows(count: number) {
	return Array.from({ length: count }, () =>
		createBlankDeliveryReceiptAccountingEntry(),
	);
}

export function duplicateEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	createId: () => string,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, { ...row, id: createId() });
	return nextRows;
}

export function insertEntryRow<TRow>(
	rows: TRow[],
	rowId: string,
	position: "above" | "below",
	createRow: () => TRow,
) {
	const rowIndex = rows.findIndex((row) => getRowId(row) === rowId);
	const insertIndex =
		rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
	const nextRows = [...rows];

	nextRows.splice(insertIndex, 0, createRow());
	return nextRows;
}

export function moveEntryRow<TRow extends { id: string }>(
	rows: TRow[],
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

export function removeEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	createFallbackRow: () => TRow,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);

	return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

export function duplicateDeliveryReceiptLine(
	rows: DeliveryReceiptLineEntry[],
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
		id: createBlankDeliveryReceiptLineEntry().id,
	});
	return nextRows;
}

export function insertDeliveryReceiptLine(
	rows: DeliveryReceiptLineEntry[],
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
		createBlankDeliveryReceiptLineEntry(),
	);
	return nextRows;
}

export function moveDeliveryReceiptLine(
	rows: DeliveryReceiptLineEntry[],
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

export function removeDeliveryReceiptLine(
	rows: DeliveryReceiptLineEntry[],
	rowId: string,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);

	return nextRows.length > 0 ? nextRows : [createBlankDeliveryReceiptLineEntry()];
}

export function clearDeliveryReceiptLines(
	rows: DeliveryReceiptLineEntry[],
	action: ModuleDataEntryClearAction,
) {
	if (action === "all") {
		return [createBlankDeliveryReceiptLineEntry()];
	}

	const nextRows = rows.filter((row) => !shouldClearDeliveryReceiptLine(row, action));

	return nextRows.length > 0 ? nextRows : [createBlankDeliveryReceiptLineEntry()];
}

function shouldClearDeliveryReceiptLine(
	entry: DeliveryReceiptLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return deliveryReceiptEntryHasData(entry);
	}

	if (action === "incomplete") {
		return deliveryReceiptEntryHasData(entry) && !deliveryReceiptEntryIsComplete(entry);
	}

	return !deliveryReceiptEntryHasData(entry);
}

export function clearDeliveryReceiptAccountingEntries(
	rows: DeliveryReceiptAccountingEntry[],
	action: ModuleDataEntryClearAction,
) {
	if (action === "all") {
		return [createBlankDeliveryReceiptAccountingEntry()];
	}

	const nextRows = rows.filter(
		(row) => !shouldClearDeliveryReceiptAccountingEntry(row, action),
	);

	return nextRows.length > 0
		? nextRows
		: [createBlankDeliveryReceiptAccountingEntry()];
}

function shouldClearDeliveryReceiptAccountingEntry(
	entry: DeliveryReceiptAccountingEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData =
		entry.accountCode.trim() !== "" ||
		entry.accountTitle.trim() !== "" ||
		entry.partyCode.trim() !== "" ||
		entry.partyName.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		entry.vatType.trim() !== "" ||
		entry.atcCode.trim() !== "" ||
		entry.responsibilityCenter.trim() !== "" ||
		entry.refNo.trim() !== "" ||
		entry.debit > 0 ||
		entry.credit > 0;

	if (action === "with-data") {
		return hasData;
	}

	if (action === "incomplete") {
		return hasData && !entry.accountTitle.trim();
	}

	return !hasData;
}

function getRowId(row: unknown) {
	return typeof row === "object" && row !== null && "id" in row
		? String(row.id)
		: "";
}
