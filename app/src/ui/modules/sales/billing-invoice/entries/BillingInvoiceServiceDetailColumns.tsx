import { BillingInvoiceDescriptionOptions } from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { BillingInvoiceLineEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	BillingInvoiceEntryAmountInput,
	BillingInvoiceEntryDropdownClassName,
	formatBillingInvoiceEntryAmount,
} from "@/app/src/ui/modules/sales/billing-invoice/entries/BillingInvoiceEntryCellControls";

type BillingInvoiceLineEntryUpdater = (
	rowId: string,
	updates: Partial<BillingInvoiceLineEntry>,
) => void;

export function createBillingInvoiceServiceDetailColumns(
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceLineEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceLineEntry>[] {
	return [
		lineDropdownColumn("description", "Professional Service Type", 260, isReadonly, onUpdateEntry),
		lineAmountColumn("amount", "Rate", 120, isReadonly, onUpdateEntry),
		lineAmountColumn("quantity", "Qty", 100, isReadonly, onUpdateEntry),
		lineAmountColumn("netAmount", "Amount", 130, isReadonly, onUpdateEntry),
		lineAmountColumn("vatAmount", "VAT", 120, isReadonly, onUpdateEntry),
		readOnlyLineAmountColumn(
			"vatInclusiveAmount",
			"VAT Inc.",
			130,
			(row) =>
				parseMoneyNumberInput(row.netAmount) +
				parseMoneyNumberInput(row.vatAmount),
		),
		lineAmountColumn(
			"discountAmount",
			"Disct",
			120,
			isReadonly,
			onUpdateEntry,
		),
		readOnlyLineAmountColumn(
			"grossAmount",
			"Net Amt",
			130,
			(row) => parseMoneyNumberInput(row.grossAmount),
		),
	];
}

function lineDropdownColumn(
	id: keyof BillingInvoiceLineEntry,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceLineEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceLineEntry> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row, _index, context) => (
			<AppAdvancedDropdown
				id={context.fieldId}
				name={context.fieldName}
				className={BillingInvoiceEntryDropdownClassName}
				value={String(row[id])}
				options={BillingInvoiceDescriptionOptions}
				placeholder=""
				readOnly={isReadonly}
				onChange={(value) => onUpdateEntry(row.id, { [id]: String(value) })}
			/>
		),
	};
}

function lineAmountColumn(
	id: keyof BillingInvoiceLineEntry,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceLineEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceLineEntry> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row, _index, context) => (
			<BillingInvoiceEntryAmountInput
				id={context.fieldId}
				name={context.fieldName}
				readOnly={isReadonly}
				value={String(row[id])}
				onValueChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
}

function readOnlyLineAmountColumn(
	id: string,
	header: string,
	width: number,
	getValue: (row: BillingInvoiceLineEntry) => number,
): ModuleDataEntryColumn<BillingInvoiceLineEntry> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row, _index, context) => (
			<BillingInvoiceEntryAmountInput
				id={context.fieldId}
				name={context.fieldName}
				readOnly
				value={formatBillingInvoiceEntryAmount(getValue(row))}
				onValueChange={() => undefined}
			/>
		),
	};
}
