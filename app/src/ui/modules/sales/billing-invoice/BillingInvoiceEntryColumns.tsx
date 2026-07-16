import {
	BillingInvoiceBooleanOptions,
	BillingInvoiceDescriptionOptions,
	BillingInvoiceResponsibilityCenterOptions,
	BillingInvoiceTaxTypeOptions,
	BillingInvoiceVatTypeOptions,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type { BillingInvoiceLineEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BillingInvoiceEntryColumnKind = "amount" | "dropdown" | "text";

type BillingInvoiceEntryColumnConfig = {
	header: string;
	id: keyof BillingInvoiceLineEntry;
	kind: BillingInvoiceEntryColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type BillingInvoiceEntryUpdater = (
	rowId: string,
	updates: Partial<BillingInvoiceLineEntry>,
) => void;

export function createBillingInvoiceEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: BillingInvoiceEntryUpdater,
): ModuleDataEntryColumn<BillingInvoiceLineEntry>[] {
	return BillingInvoiceEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<BillingInvoiceEntryCell
				column={column}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function BillingInvoiceEntryCell({
	column,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: BillingInvoiceEntryColumnConfig;
	isReadonly: boolean;
	onUpdateEntry: BillingInvoiceEntryUpdater;
	row: BillingInvoiceLineEntry;
}) {
	const value = String(row[column.id]);

	if (column.kind === "dropdown") {
		return (
			<EntryDropdown
				options={column.options ?? []}
				readOnly={isReadonly}
				value={value}
				onChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: nextValue })
				}
			/>
		);
	}

	if (column.kind === "amount") {
		return (
			<EntryAmountInput
				value={value}
				readOnly={isReadonly}
				onValueChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: nextValue })
				}
			/>
		);
	}

	return (
		<EntryInput
			value={value}
			readOnly={isReadonly}
			onChange={(nextValue) => onUpdateEntry(row.id, { [column.id]: nextValue })}
		/>
	);
}

function EntryDropdown({
	onChange,
	options,
	readOnly,
	value,
}: {
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	readOnly: boolean;
	value: string;
}) {
	return (
		<AppAdvancedDropdown
			className={EntryDropdownClassName}
			value={value}
			options={options}
			placeholder=""
			readOnly={readOnly}
			onChange={(nextValue) => onChange(String(nextValue))}
		/>
	);
}

function EntryInput({
	onChange,
	readOnly,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<input
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={entryCellControlClassName()}
		/>
	);
}

function EntryAmountInput({
	onValueChange,
	readOnly,
	value,
}: {
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<MoneyNumberField
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

const BillingInvoiceEntryColumnConfigs = [
	column(
		"Description",
		"description",
		"dropdown",
		300,
		"w-[19rem]",
		BillingInvoiceDescriptionOptions,
	),
	column("Particulars", "particulars", "text", 280, "w-[17.5rem]"),
	column("Amount", "amount", "amount", 130, "w-[8rem]"),
	column("Qty", "quantity", "amount", 120, "w-[7.5rem]"),
	column("Net Amount", "netAmount", "amount", 130, "w-[8rem]"),
	column("VAT Amount", "vatAmount", "amount", 130, "w-[8rem]"),
	column("WVAT Amount", "wvatAmount", "amount", 130, "w-[8rem]"),
	column("EWT Amount", "ewtAmount", "amount", 130, "w-[8rem]"),
	column("Discount %", "discountPercent", "text", 120, "w-[7.5rem]"),
	column("Discount Amount", "discountAmount", "amount", 140, "w-[8.75rem]"),
	column("Gross Amount", "grossAmount", "amount", 140, "w-[8.75rem]"),
	column(
		"VAT Type",
		"vatType",
		"dropdown",
		130,
		"w-[8rem]",
		BillingInvoiceVatTypeOptions,
	),
	column(
		"VATable",
		"vatable",
		"dropdown",
		110,
		"w-[7rem]",
		BillingInvoiceBooleanOptions,
	),
	column(
		"VAT Inc.",
		"vatInclusive",
		"dropdown",
		110,
		"w-[7rem]",
		BillingInvoiceBooleanOptions,
	),
	column(
		"With WVAT",
		"withWvat",
		"dropdown",
		110,
		"w-[7rem]",
		BillingInvoiceBooleanOptions,
	),
	column(
		"WVAT Type",
		"wvatType",
		"dropdown",
		120,
		"w-[7.5rem]",
		BillingInvoiceTaxTypeOptions,
	),
	column(
		"With EWT",
		"withEwt",
		"dropdown",
		110,
		"w-[7rem]",
		BillingInvoiceBooleanOptions,
	),
	column(
		"EWT Type",
		"ewtType",
		"dropdown",
		110,
		"w-[7rem]",
		BillingInvoiceTaxTypeOptions,
	),
	column(
		"Res. Center",
		"responsibilityCenter",
		"dropdown",
		210,
		"w-[13rem]",
		BillingInvoiceResponsibilityCenterOptions,
	),
];

function column(
	header: string,
	id: keyof BillingInvoiceLineEntry,
	kind: BillingInvoiceEntryColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): BillingInvoiceEntryColumnConfig {
	return {
		header,
		id,
		kind,
		options,
		width,
		widthClassName,
	};
}

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

