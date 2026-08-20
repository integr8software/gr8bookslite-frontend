import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
	billingInvoiceEntryHasData,
	billingInvoiceEntryIsComplete,
	createBlankBillingInvoiceAccountEntry,
	createBlankBillingInvoiceLineEntry,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function recalculateBillingInvoiceLineEntry(
	entry: BillingInvoiceLineEntry,
): BillingInvoiceLineEntry {
	const amount = parseMoneyNumberInput(entry.amount);
	const quantity = parseMoneyNumberInput(entry.quantity);
	const netAmount = amount * Math.max(quantity, 0);
	const discountPercent = parseMoneyNumberInput(entry.discountPercent);
	const discountAmount = netAmount * (Math.max(discountPercent, 0) / 100);
	const grossAfterDiscount = Math.max(netAmount - discountAmount, 0);
	const isVatable = entry.vatable.toLowerCase() === "true";
	const isVatInclusive =
		isVatable && entry.vatInclusive.toLowerCase() === "true";
	const vatAmount = !isVatable
		? 0
		: isVatInclusive
			? (grossAfterDiscount / 1.12) * 0.12
			: grossAfterDiscount * 0.12;
	const netOfVatAmount =
		isVatable && isVatInclusive
			? Math.max(grossAfterDiscount - vatAmount, 0)
			: grossAfterDiscount;
	const grossAmount =
		isVatable && !isVatInclusive
			? grossAfterDiscount + vatAmount
			: grossAfterDiscount;

	return {
		...entry,
		discountAmount: discountAmount.toFixed(2),
		grossAmount: grossAmount.toFixed(2),
		grossAfterDiscount: grossAfterDiscount.toFixed(2),
		netAmount: netAmount.toFixed(2),
		netOfVatAmount: netOfVatAmount.toFixed(2),
		vatAmount: vatAmount.toFixed(2),
	};
}

export function calculateBillingInvoiceAccountEntryTotals(
	rows: BillingInvoiceAccountEntry[],
) {
	return rows.reduce(
		(totals, row) => ({
			credit: totals.credit + parseMoneyNumberInput(row.credit),
			debit: totals.debit + parseMoneyNumberInput(row.debit),
		}),
		{ credit: 0, debit: 0 },
	);
}

export function clearBillingInvoiceLineRows(
	action: ModuleDataEntryClearAction,
	rows: BillingInvoiceLineEntry[],
) {
	if (action === "all") {
		return [createBlankBillingInvoiceLineEntry()];
	}

	const nextRows = rows.filter((row) => !shouldClearLineEntry(row, action));
	return nextRows.length > 0 ? nextRows : [createBlankBillingInvoiceLineEntry()];
}

export function duplicateBillingInvoiceLineRow(
	rowId: string,
	rows: BillingInvoiceLineEntry[],
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createBlankBillingInvoiceLineEntry().id,
	});

	return nextRows;
}

export function insertBillingInvoiceLineRow(
	rowId: string,
	position: "above" | "below",
	rows: BillingInvoiceLineEntry[],
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createBlankBillingInvoiceLineEntry(),
	);

	return nextRows;
}

export function removeBillingInvoiceLineRow(
	rowId: string,
	rows: BillingInvoiceLineEntry[],
) {
	const nextRows = rows.filter((row) => row.id !== rowId);
	return nextRows.length > 0 ? nextRows : [createBlankBillingInvoiceLineEntry()];
}

export function clearBillingInvoiceAccountRows(
	action: ModuleDataEntryClearAction,
	rows: BillingInvoiceAccountEntry[],
) {
	if (action === "all") {
		return [createBlankBillingInvoiceAccountEntry()];
	}

	const nextRows = rows.filter((row) => !shouldClearAccountEntry(row, action));
	return nextRows.length > 0
		? nextRows
		: [createBlankBillingInvoiceAccountEntry()];
}

export function duplicateBillingInvoiceAccountRow(
	rowId: string,
	rows: BillingInvoiceAccountEntry[],
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createBlankBillingInvoiceAccountEntry().id,
	});

	return nextRows;
}

export function insertBillingInvoiceAccountRow(
	rowId: string,
	position: "above" | "below",
	rows: BillingInvoiceAccountEntry[],
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createBlankBillingInvoiceAccountEntry(),
	);

	return nextRows;
}

export function removeBillingInvoiceAccountRow(
	rowId: string,
	rows: BillingInvoiceAccountEntry[],
) {
	const nextRows = rows.filter((row) => row.id !== rowId);
	return nextRows.length > 0
		? nextRows
		: [createBlankBillingInvoiceAccountEntry()];
}

export function moveBillingInvoiceEntryRow<TRow extends { id: string }>(
	fromRowId: string,
	toRowId: string,
	rows: TRow[],
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

export function updateBillingInvoiceVisibleColumnIds(
	visibleColumnIds: string[],
	columnOrder: string[],
	columnId: string,
	isVisible: boolean,
) {
	if (isVisible) {
		const nextVisibleIds = new Set([...visibleColumnIds, columnId]);
		return columnOrder.filter((currentColumnId) =>
			nextVisibleIds.has(currentColumnId),
		);
	}

	if (visibleColumnIds.length <= 1) {
		return visibleColumnIds;
	}

	return visibleColumnIds.filter(
		(currentColumnId) => currentColumnId !== columnId,
	);
}

function shouldClearLineEntry(
	entry: BillingInvoiceLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return billingInvoiceEntryHasData(entry);
	}

	if (action === "incomplete") {
		return (
			billingInvoiceEntryHasData(entry) &&
			!billingInvoiceEntryIsComplete(entry)
		);
	}

	return !billingInvoiceEntryHasData(entry);
}

function shouldClearAccountEntry(
	entry: BillingInvoiceAccountEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData =
		entry.accountCode.trim() !== "" ||
		entry.accountTitle.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		entry.vatType.trim() !== "" ||
		entry.atcCode.trim() !== "" ||
		entry.partyCode.trim() !== "" ||
		entry.partyName.trim() !== "" ||
		entry.responsibilityCenter.trim() !== "" ||
		entry.refNo.trim() !== "" ||
		entry.debit.trim() !== "" ||
		entry.credit.trim() !== "";
	const isComplete =
		entry.accountCode.trim() !== "" ||
		entry.accountTitle.trim() !== "" ||
		parseMoneyNumberInput(entry.debit) > 0 ||
		parseMoneyNumberInput(entry.credit) > 0;

	if (action === "with-data") {
		return hasData;
	}

	if (action === "incomplete") {
		return hasData && !isComplete;
	}

	return !hasData;
}
