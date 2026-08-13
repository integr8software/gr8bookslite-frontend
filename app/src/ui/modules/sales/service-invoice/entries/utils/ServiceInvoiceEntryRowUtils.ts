import {
	createBlankServiceInvoiceLineEntry,
	serviceInvoiceEntryHasData,
	serviceInvoiceEntryIsComplete,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type {
	ServiceInvoiceAccountingEntry,
	ServiceInvoiceLineEntry,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

export function recalculateServiceInvoiceEntry(
	entry: ServiceInvoiceLineEntry,
	updates: Partial<ServiceInvoiceLineEntry> = {},
): ServiceInvoiceLineEntry {
	const amount = parseMoneyNumberInput(entry.amount);
	const quantity = parseMoneyNumberInput(entry.quantity);
	const baseAmount = amount * Math.max(quantity, 0);
	const isVatInclusive = entry.vatInclusive.toLowerCase() === "true";
	const shouldRecalculateVat =
		"amount" in updates ||
		"quantity" in updates ||
		("vatInclusive" in updates && isVatInclusive);
	const vatAmount = !isVatInclusive
		? 0
		: shouldRecalculateVat
			? baseAmount * 0.12
			: parseMoneyNumberInput(entry.vatAmount);
	const vatInclusiveAmount = baseAmount + vatAmount;
	const discountPercent = parseMoneyNumberInput(entry.discountPercent);
	const enteredDiscountAmount = parseMoneyNumberInput(entry.discountAmount);
	const shouldRecalculateDiscount =
		"amount" in updates ||
		"quantity" in updates ||
		"vatAmount" in updates ||
		"vatInclusive" in updates ||
		"discountPercent" in updates;
	const computedDiscountAmount = shouldRecalculateDiscount
		? vatInclusiveAmount * (Math.max(discountPercent, 0) / 100)
		: enteredDiscountAmount;
	const computedNetAmount = vatInclusiveAmount - computedDiscountAmount;

	return {
		...entry,
		discountAmount: computedDiscountAmount.toFixed(2),
		grossAmount: Math.max(computedNetAmount, 0).toFixed(2),
		netAmount: baseAmount.toFixed(2),
		vatAmount: vatAmount.toFixed(2),
	};
}

export function createBlankServiceInvoiceAccountingEntry(): ServiceInvoiceAccountingEntry {
	return {
		id: `svi-accounting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

export function createServiceInvoiceLineEntries(count: number) {
	return Array.from({ length: count }, () =>
		createBlankServiceInvoiceLineEntry(),
	);
}

export function createServiceInvoiceAccountingEntries(count: number) {
	return Array.from({ length: count }, () =>
		createBlankServiceInvoiceAccountingEntry(),
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

export function shouldClearServiceInvoiceLineEntry(
	entry: ServiceInvoiceLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return serviceInvoiceEntryHasData(entry);
	}

	if (action === "incomplete") {
		return serviceInvoiceEntryHasData(entry) && !serviceInvoiceEntryIsComplete(entry);
	}

	return !serviceInvoiceEntryHasData(entry);
}

export function shouldClearServiceInvoiceAccountingEntry(
	entry: ServiceInvoiceAccountingEntry,
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
