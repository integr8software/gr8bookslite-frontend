import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	SalesJournalEntryClearAction,
	SalesJournalItemEntry,
	SalesJournalLine,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";

export function recalculateSalesJournalItemEntry(
	entry: SalesJournalItemEntry,
): SalesJournalItemEntry {
	const rate = parseMoneyNumberInput(entry.rate);
	const quantity = parseMoneyNumberInput(entry.quantity);
	const amount = rate * quantity;
	const nextAmount = amount > 0 ? amount : parseMoneyNumberInput(entry.amount);
	const vatAmount =
		nextAmount > 0
			? nextAmount * 0.12
			: parseMoneyNumberInput(entry.vatAmount);
	const discountAmount = parseMoneyNumberInput(entry.discountAmount);
	const netAmount = Math.max(nextAmount + vatAmount - discountAmount, 0);

	return {
		...entry,
		amount: nextAmount.toFixed(2),
		vatAmount: vatAmount.toFixed(2),
		netAmount: netAmount.toFixed(2),
	};
}

export function calculateSalesJournalItemTotals(rows: SalesJournalItemEntry[]) {
	return rows.reduce(
		(totals, row) => {
			const amount = parseMoneyNumberInput(row.amount);
			const vatAmount = parseMoneyNumberInput(row.vatAmount);

			return {
				amount: totals.amount + amount,
				discountAmount:
					totals.discountAmount + parseMoneyNumberInput(row.discountAmount),
				netAmount: totals.netAmount + parseMoneyNumberInput(row.netAmount),
				vatAmount: totals.vatAmount + vatAmount,
				vatInclusiveAmount: totals.vatInclusiveAmount + amount + vatAmount,
			};
		},
		{
			amount: 0,
			discountAmount: 0,
			netAmount: 0,
			vatAmount: 0,
			vatInclusiveAmount: 0,
		},
	);
}

export function getSalesJournalItemVatInclusiveAmount(
	row: SalesJournalItemEntry,
) {
	return parseMoneyNumberInput(row.amount) + parseMoneyNumberInput(row.vatAmount);
}

export function shouldClearSalesJournalItemEntry(
	entry: SalesJournalItemEntry,
	action: Exclude<SalesJournalEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return salesJournalItemEntryHasData(entry);
	}

	if (action === "incomplete") {
		return (
			salesJournalItemEntryHasData(entry) &&
			!salesJournalItemEntryIsComplete(entry)
		);
	}

	return !salesJournalItemEntryHasData(entry);
}

export function shouldClearSalesJournalAccountEntry(
	entry: SalesJournalLine,
	action: Exclude<SalesJournalEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return salesJournalAccountEntryHasData(entry);
	}

	if (action === "incomplete") {
		return (
			salesJournalAccountEntryHasData(entry) &&
			!salesJournalAccountEntryIsComplete(entry)
		);
	}

	return !salesJournalAccountEntryHasData(entry);
}

export function duplicateSalesJournalRow<TRow extends { id: string }>(
	rowId: string,
	rows: TRow[],
	createRow: () => TRow,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createRow().id,
	});
	return nextRows;
}

export function insertSalesJournalRow<TRow extends { id: string }>(
	rowId: string,
	position: "above" | "below",
	rows: TRow[],
	createRow: (index: number) => TRow,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return rows;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createRow(rowIndex),
	);
	return nextRows;
}

export function moveSalesJournalRow<TRow extends { id: string }>(
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

function salesJournalItemEntryHasData(entry: SalesJournalItemEntry) {
	return (
		entry.professionalServiceType.trim().length > 0 ||
		parseMoneyNumberInput(entry.rate) > 0 ||
		parseMoneyNumberInput(entry.quantity) > 0 ||
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.vatAmount) > 0 ||
		parseMoneyNumberInput(entry.discountAmount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0
	);
}

function salesJournalItemEntryIsComplete(entry: SalesJournalItemEntry) {
	return (
		entry.professionalServiceType.trim().length > 0 &&
		parseMoneyNumberInput(entry.amount) > 0
	);
}

function salesJournalAccountEntryHasData(entry: SalesJournalLine) {
	return (
		entry.accountCode.trim().length > 0 ||
		entry.accountTitle.trim().length > 0 ||
		Number(entry.debit || 0) > 0 ||
		Number(entry.credit || 0) > 0 ||
		entry.particulars.trim().length > 0 ||
		entry.partyCode.trim().length > 0 ||
		entry.partyName.trim().length > 0 ||
		entry.responsibilityCenter.trim().length > 0 ||
		entry.refNo.trim().length > 0 ||
		entry.atcCode.trim().length > 0
	);
}

function salesJournalAccountEntryIsComplete(entry: SalesJournalLine) {
	return (
		entry.accountCode.trim().length > 0 &&
		entry.accountTitle.trim().length > 0 &&
		(Number(entry.debit || 0) > 0 || Number(entry.credit || 0) > 0)
	);
}
