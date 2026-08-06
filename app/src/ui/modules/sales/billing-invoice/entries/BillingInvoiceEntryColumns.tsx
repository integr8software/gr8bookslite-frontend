import { BillingInvoiceDescriptionOptions } from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
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

export function createBillingInvoiceAccountEntryColumns(
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
				className={EntryDropdownClassName}
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
			<EntryAmountInput
				id={context.fieldId}
				name={context.fieldName}
				readOnly
				value={formatBillingInvoiceEntryAmount(getValue(row))}
				onValueChange={() => undefined}
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

function formatBillingInvoiceEntryAmount(value: number) {
	return new Intl.NumberFormat("en-PH", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(value);
}

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
