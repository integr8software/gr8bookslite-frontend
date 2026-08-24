import {
	createBlankBillingLineEntry,
	billingEntryHasData,
	billingEntryIsComplete,
} from "@/app/src/data/modules/sales/billing/BillingData";
import type {
	BillingAccountingEntry,
	BillingLineEntry,
} from "@/app/src/types/modules/sales/billing/BillingTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

export function recalculateBillingEntry(
	entry: BillingLineEntry,
	_updates: Partial<BillingLineEntry> = {},
): BillingLineEntry {
	const amount = parseMoneyNumberInput(entry.amount);
	const quantity = parseMoneyNumberInput(entry.quantity);
	const grossAmount = amount * Math.max(quantity, 0);
	const discountPercent = parseMoneyNumberInput(entry.discountPercent);
	const discountAmount =
		grossAmount * (Math.max(discountPercent, 0) / 100);
	const grossAfterDiscount = Math.max(grossAmount - discountAmount, 0);
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
	const netAmount = isVatable && !isVatInclusive
		? grossAfterDiscount + vatAmount
		: grossAfterDiscount;

	return {
		...entry,
		discountAmount: discountAmount.toFixed(2),
		grossAmount: netAmount.toFixed(2),
		grossAfterDiscount: grossAfterDiscount.toFixed(2),
		netAmount: grossAmount.toFixed(2),
		netOfVatAmount: netOfVatAmount.toFixed(2),
		vatAmount: vatAmount.toFixed(2),
	};
}

export function createBlankBillingAccountingEntry(): BillingAccountingEntry {
	return {
		id: `b-accounting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		accountCode: "",
		accountTitle: "",
		debit: 0,
		credit: 0,
		partyCode: "",
		partyName: "",
		particulars: "",
		vatType: "",
		atcCode: "",
		responsibilityCenter: "",
		refNo: "",
	};
}

export function createBillingLineEntries(count: number) {
	return Array.from({ length: count }, () =>
		createBlankBillingLineEntry(),
	);
}

export function createBillingAccountingEntries(count: number) {
	return Array.from({ length: count }, () =>
		createBlankBillingAccountingEntry(),
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

export function shouldClearBillingLineEntry(
	entry: BillingLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return billingEntryHasData(entry);
	}

	if (action === "incomplete") {
		return billingEntryHasData(entry) && !billingEntryIsComplete(entry);
	}

	return !billingEntryHasData(entry);
}

export function shouldClearBillingAccountingEntry(
	entry: BillingAccountingEntry,
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
