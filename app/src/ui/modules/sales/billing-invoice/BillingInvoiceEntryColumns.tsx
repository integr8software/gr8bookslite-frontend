import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
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
		lineTextColumn("itemNo", "Item No", 140, isReadonly, onUpdateEntry),
		lineTextColumn("itemName", "Item Name", 220, isReadonly, onUpdateEntry),
		lineAmountColumn("amount", "Unit Price", 140, isReadonly, onUpdateEntry),
		lineAmountColumn("quantity", "Qty", 110, isReadonly, onUpdateEntry),
		lineAmountColumn("netAmount", "Amount", 140, isReadonly, onUpdateEntry),
		lineAmountColumn("vatAmount", "VAT", 140, isReadonly, onUpdateEntry),
		readOnlyLineAmountColumn(
			"vatInclusiveAmount",
			"VAT Inc.",
			140,
			(row) =>
				parseMoneyNumberInput(row.netAmount) +
				parseMoneyNumberInput(row.vatAmount),
		),
		lineAmountColumn(
			"discountAmount",
			"Disct",
			130,
			isReadonly,
			onUpdateEntry,
		),
		readOnlyLineAmountColumn(
			"grossAmount",
			"Net Amount",
			150,
			(row) => parseMoneyNumberInput(row.grossAmount),
		),
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

function lineTextColumn(
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
