import {
	ServiceInvoiceBooleanOptions,
	ServiceInvoiceDescriptionOptions,
	ServiceInvoiceResponsibilityCenterOptions,
	ServiceInvoiceTaxTypeOptions,
	ServiceInvoiceVatTypeOptions,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceLineEntry } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ServiceInvoiceEntryColumnKind = "amount" | "dropdown" | "text";

type ServiceInvoiceEntryColumnConfig = {
	header: string;
	id: keyof ServiceInvoiceLineEntry;
	kind: ServiceInvoiceEntryColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type ServiceInvoiceEntryUpdater = (
	rowId: string,
	updates: Partial<ServiceInvoiceLineEntry>,
) => void;

export function createServiceInvoiceEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: ServiceInvoiceEntryUpdater,
): ModuleDataEntryColumn<ServiceInvoiceLineEntry>[] {
	return ServiceInvoiceEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<ServiceInvoiceEntryCell
				column={column}
				fieldId={context.fieldId}
				fieldName={context.fieldName}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function ServiceInvoiceEntryCell({
	column,
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: ServiceInvoiceEntryColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: ServiceInvoiceEntryUpdater;
	row: ServiceInvoiceLineEntry;
}) {
	const value = String(row[column.id]);

	if (column.kind === "dropdown") {
		return (
			<EntryDropdown
				id={fieldId}
				name={fieldName}
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
				id={fieldId}
				name={fieldName}
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
			id={fieldId}
			name={fieldName}
			value={value}
			readOnly={isReadonly}
			onChange={(nextValue) => onUpdateEntry(row.id, { [column.id]: nextValue })}
		/>
	);
}

function EntryDropdown({
	id,
	name,
	onChange,
	options,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	readOnly: boolean;
	value: string;
}) {
	return (
		<AppAdvancedDropdown
			id={id}
			name={name}
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

const ServiceInvoiceEntryColumnConfigs = [
	column(
		"Description",
		"description",
		"dropdown",
		300,
		"w-[19rem]",
		ServiceInvoiceDescriptionOptions,
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
		ServiceInvoiceVatTypeOptions,
	),
	column(
		"VATable",
		"vatable",
		"dropdown",
		110,
		"w-[7rem]",
		ServiceInvoiceBooleanOptions,
	),
	column(
		"VAT Inc.",
		"vatInclusive",
		"dropdown",
		110,
		"w-[7rem]",
		ServiceInvoiceBooleanOptions,
	),
	column(
		"With WVAT",
		"withWvat",
		"dropdown",
		110,
		"w-[7rem]",
		ServiceInvoiceBooleanOptions,
	),
	column(
		"WVAT Type",
		"wvatType",
		"dropdown",
		120,
		"w-[7.5rem]",
		ServiceInvoiceTaxTypeOptions,
	),
	column(
		"With EWT",
		"withEwt",
		"dropdown",
		110,
		"w-[7rem]",
		ServiceInvoiceBooleanOptions,
	),
	column(
		"EWT Type",
		"ewtType",
		"dropdown",
		110,
		"w-[7rem]",
		ServiceInvoiceTaxTypeOptions,
	),
	column(
		"Res. Center",
		"responsibilityCenter",
		"dropdown",
		210,
		"w-[13rem]",
		ServiceInvoiceResponsibilityCenterOptions,
	),
];

function column(
	header: string,
	id: keyof ServiceInvoiceLineEntry,
	kind: ServiceInvoiceEntryColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): ServiceInvoiceEntryColumnConfig {
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
