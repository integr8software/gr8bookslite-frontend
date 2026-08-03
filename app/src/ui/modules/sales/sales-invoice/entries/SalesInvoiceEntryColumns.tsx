import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	SalesInvoiceAccountEntry,
	SalesInvoiceLineItem,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	SalesInvoiceEntryAmountInput,
	SalesInvoiceEntryInput,
} from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntryCellControls";
import { formatSalesInvoiceEntryAmount } from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntryRowUtils";

export function createSalesInvoiceItemColumns(
	isReadonly: boolean,
	onUpdateEntry: (
		rowId: string,
		updates: Partial<SalesInvoiceLineItem>,
	) => void,
): ModuleDataEntryColumn<SalesInvoiceLineItem>[] {
	return [
		itemTextColumn("itemCode", "Item No", 140, isReadonly, onUpdateEntry),
		itemTextColumn("name", "Item Name", 220, isReadonly, onUpdateEntry),
		itemAmountColumn("price", "Unit Price", 140, isReadonly, onUpdateEntry),
		itemAmountColumn("quantity", "Qty", 110, isReadonly, onUpdateEntry),
		itemAmountColumn("totalSales", "Amount", 140, isReadonly, onUpdateEntry),
		itemAmountColumn("vatAmount", "VAT", 140, isReadonly, onUpdateEntry),
		readOnlyItemAmountColumn(
			"vatInclusiveAmount",
			"VAT Inc.",
			140,
			(row) =>
				parseMoneyNumberInput(row.totalSales) +
				parseMoneyNumberInput(row.vatAmount),
		),
		itemAmountColumn("discount", "Disct", 130, isReadonly, onUpdateEntry),
		readOnlyItemAmountColumn(
			"amountDue",
			"Net Amount",
			150,
			(row) =>
				parseMoneyNumberInput(row.totalSales) +
				parseMoneyNumberInput(row.vatAmount) -
				parseMoneyNumberInput(row.discount),
		),
	];
}

export function createSalesInvoiceAccountColumns(
	isReadonly: boolean,
	onUpdateEntry: (
		rowId: string,
		updates: Partial<SalesInvoiceAccountEntry>,
	) => void,
): ModuleDataEntryColumn<SalesInvoiceAccountEntry>[] {
	return [
		accountTextColumn("accountCode", "Acct Code", 180, isReadonly, onUpdateEntry),
		accountTextColumn(
			"accountTitle",
			"Acct Title",
			320,
			isReadonly,
			onUpdateEntry,
		),
		accountAmountColumn("debit", "Debit", 150, isReadonly, onUpdateEntry),
		accountAmountColumn("credit", "Credit", 150, isReadonly, onUpdateEntry),
	];
}

function itemTextColumn(
	id: keyof SalesInvoiceLineItem,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: (rowId: string, updates: Partial<SalesInvoiceLineItem>) => void,
): ModuleDataEntryColumn<SalesInvoiceLineItem> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row) => (
			<SalesInvoiceEntryInput
				readOnly={isReadonly}
				value={String(row[id])}
				onChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
}

function itemAmountColumn(
	id: keyof SalesInvoiceLineItem,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: (rowId: string, updates: Partial<SalesInvoiceLineItem>) => void,
): ModuleDataEntryColumn<SalesInvoiceLineItem> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row) => (
			<SalesInvoiceEntryAmountInput
				readOnly={isReadonly}
				value={String(row[id])}
				onValueChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
}

function readOnlyItemAmountColumn(
	id: string,
	header: string,
	width: number,
	getValue: (row: SalesInvoiceLineItem) => number,
): ModuleDataEntryColumn<SalesInvoiceLineItem> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row) => (
			<SalesInvoiceEntryAmountInput
				readOnly
				value={formatSalesInvoiceEntryAmount(getValue(row))}
				onValueChange={() => undefined}
			/>
		),
	};
}

function accountTextColumn(
	id: keyof SalesInvoiceAccountEntry,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: (
		rowId: string,
		updates: Partial<SalesInvoiceAccountEntry>,
	) => void,
): ModuleDataEntryColumn<SalesInvoiceAccountEntry> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row) => (
			<SalesInvoiceEntryInput
				readOnly={isReadonly}
				value={String(row[id])}
				onChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
}

function accountAmountColumn(
	id: keyof SalesInvoiceAccountEntry,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: (
		rowId: string,
		updates: Partial<SalesInvoiceAccountEntry>,
	) => void,
): ModuleDataEntryColumn<SalesInvoiceAccountEntry> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row) => (
			<SalesInvoiceEntryAmountInput
				readOnly={isReadonly}
				value={String(row[id])}
				onValueChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
}
