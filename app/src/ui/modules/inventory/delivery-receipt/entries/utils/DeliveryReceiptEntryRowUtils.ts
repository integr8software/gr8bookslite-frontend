import {
	createBlankDeliveryReceiptLineEntry,
	deliveryReceiptEntryHasData,
	deliveryReceiptEntryIsComplete,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptLineEntry } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function createDeliveryReceiptLineEntries(count: number) {
	return Array.from({ length: count }, () =>
		createBlankDeliveryReceiptLineEntry(),
	);
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
