import {
	calculateSalesInvoiceTotals,
	salesInvoiceLineHasData,
	salesInvoiceLineIsComplete,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	SalesInvoiceAccountEntry,
	SalesInvoiceLineItem,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import type {
	ModuleDataEntryClearAction,
	ModuleDataEntryColumn,
	ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function createSalesInvoiceColumnOptions<TRow>(
	columns: ModuleDataEntryColumn<TRow>[],
	hideableColumnIds: string[] = [],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: hideableColumnIds.includes(column.id),
		isVisible: true,
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}

export function calculateSalesInvoiceItemEntrySummary(
	rows: SalesInvoiceLineItem[],
) {
	const totals = calculateSalesInvoiceTotals(rows);
	const vatInclusiveTotal = totals.grossAmount + totals.vatAmount;
	const netAmountTotal = vatInclusiveTotal - totals.discount;

	return {
		netAmountTotal,
		summaryCells: {
			amountDue: formatSalesInvoiceEntryAmount(netAmountTotal),
			discount: formatSalesInvoiceEntryAmount(totals.discount),
			totalSales: formatSalesInvoiceEntryAmount(totals.grossAmount),
			vatAmount: formatSalesInvoiceEntryAmount(totals.vatAmount),
			vatInclusiveAmount: formatSalesInvoiceEntryAmount(vatInclusiveTotal),
		},
	};
}

export function calculateSalesInvoiceAccountEntryTotals(
	rows: SalesInvoiceAccountEntry[],
) {
	return rows.reduce(
		(totals, row) => ({
			credit: totals.credit + parseMoneyNumberInput(row.credit),
			debit: totals.debit + parseMoneyNumberInput(row.debit),
		}),
		{ credit: 0, debit: 0 },
	);
}

export function formatSalesInvoiceEntryAmount(value: number) {
	return new Intl.NumberFormat("en-PH", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(value);
}

export function shouldClearSalesInvoiceLineItem(
	entry: SalesInvoiceLineItem,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return salesInvoiceLineHasData(entry);
	}

	if (action === "incomplete") {
		return salesInvoiceLineHasData(entry) && !salesInvoiceLineIsComplete(entry);
	}

	return !salesInvoiceLineHasData(entry);
}

export function shouldClearSalesInvoiceAccountEntry(
	entry: SalesInvoiceAccountEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData =
		entry.accountCode.trim() !== "" ||
		entry.accountTitle.trim() !== "" ||
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
