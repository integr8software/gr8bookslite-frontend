import { BillingInvoiceDescriptionOptions } from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BillingInvoiceLineEntryUpdater = (
	rowId: string,
	updates: Partial<BillingInvoiceLineEntry>,
) => void;

type BillingInvoiceAccountEntryUpdater = (
	rowId: string,
	updates: Partial<BillingInvoiceAccountEntry>,
) => void;

export function createBillingInvoiceItemEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceLineEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceLineEntry>[] {
	return [
		lineDropdownColumn(
			"description",
			"Professional Service Type",
			260,
			isReadonly,
			onUpdateEntry,
			BillingInvoiceDescriptionOptions,
		),
		lineAmountColumn("amount", "Rate", 120, isReadonly, onUpdateEntry),
		lineAmountColumn("quantity", "Qty", 100, isReadonly, onUpdateEntry),
		lineAmountColumn("netAmount", "Amount", 130, isReadonly, onUpdateEntry),
		lineAmountColumn("vatAmount", "VAT", 120, isReadonly, onUpdateEntry),
		lineAmountColumn("wvatAmount", "VAT Inc.", 130, isReadonly, onUpdateEntry),
		lineAmountColumn("discountAmount", "Disct", 120, isReadonly, onUpdateEntry),
		lineAmountColumn("grossAmount", "Net Amt", 130, isReadonly, onUpdateEntry),
	];
}

export function createBillingInvoiceAccountEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceAccountEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceAccountEntry>[] {
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

function lineDropdownColumn(
	id: keyof BillingInvoiceLineEntry,
	header: string,
	width: number,
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceLineEntryUpdater,
	options: AppAdvancedDropdownOption[],
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
				className={EntryDropdownClassName}
				options={options}
				placeholder=""
				readOnly={isReadonly}
				value={String(row[id])}
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
			<EntryAmountInput
				id={context.fieldId}
				name={context.fieldName}
				readOnly={isReadonly}
				value={String(row[id])}
				onValueChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
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
			<EntryInput
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
			<EntryAmountInput
				id={context.fieldId}
				name={context.fieldName}
				readOnly={isReadonly}
				value={String(row[id])}
				onValueChange={(value) => onUpdateEntry(row.id, { [id]: value })}
			/>
		),
	};
}

function EntryInput({
	id,
	name,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<input
			id={id}
			name={name}
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={entryCellControlClassName()}
		/>
	);
}

function EntryAmountInput({
	id,
	name,
	onValueChange,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<MoneyNumberField
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
			className={entryCellControlClassName("text-right tabular-nums")}
		/>
	);
}

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
