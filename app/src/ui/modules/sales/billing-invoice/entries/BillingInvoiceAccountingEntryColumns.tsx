import type { BillingInvoiceAccountEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	BillingInvoiceEntryAmountInput,
	BillingInvoiceEntryTextInput,
} from "@/app/src/ui/modules/sales/billing-invoice/entries/BillingInvoiceEntryCellControls";

type BillingInvoiceAccountEntryUpdater = (
	rowId: string,
	updates: Partial<BillingInvoiceAccountEntry>,
) => void;

export function createBillingInvoiceAccountingEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceAccountEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceAccountEntry>[] {
	return [
		accountTextColumn("accountCode", "Account Code", 160, isReadonly, onUpdateEntry),
		accountTextColumn(
			"accountTitle",
			"Account Title",
			260,
			isReadonly,
			onUpdateEntry,
		),
		accountAmountColumn("debit", "Debit", 160, isReadonly, onUpdateEntry),
		accountAmountColumn("credit", "Credit", 160, isReadonly, onUpdateEntry),
		accountTextColumn("partyCode", "Party Code", 150, isReadonly, onUpdateEntry),
		accountTextColumn("partyName", "Party Name", 220, isReadonly, onUpdateEntry),
		accountTextColumn("particulars", "Particulars", 320, isReadonly, onUpdateEntry),
		accountTextColumn("vatType", "VAT Type", 150, isReadonly, onUpdateEntry),
		accountTextColumn("atcCode", "EWT Code", 140, isReadonly, onUpdateEntry),
		accountTextColumn(
			"responsibilityCenter",
			"Responsibility Center",
			220,
			isReadonly,
			onUpdateEntry,
		),
		accountTextColumn("refNo", "Reference No", 160, isReadonly, onUpdateEntry),
	];
}

function accountTextColumn(
	id: keyof BillingInvoiceAccountEntry,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceAccountEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceAccountEntry> {
	return {
		header,
		id,
		width,
		widthClassName: `w-[${width / 16}rem]`,
		renderCell: (row, _index, context) => (
			<BillingInvoiceEntryTextInput
				id={context.fieldId}
				name={context.fieldName}
				readOnly={isReadonly}
				value={String(row[id])}
				onChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
}

function accountAmountColumn(
	id: keyof BillingInvoiceAccountEntry,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceAccountEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceAccountEntry> {
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
