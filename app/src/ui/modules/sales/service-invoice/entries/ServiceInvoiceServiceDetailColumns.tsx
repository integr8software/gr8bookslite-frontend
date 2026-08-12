import {
	ServiceInvoiceDescriptionOptions,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceLineEntry } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	ServiceInvoiceEntryAmountInput,
	ServiceInvoiceEntryTextInput,
} from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceEntryCellControls";

type ServiceInvoiceServiceDetailColumnKind =
	| "amount"
	| "boolean"
	| "dropdown"
	| "text";

type ServiceInvoiceServiceDetailColumnConfig = {
	header: string;
	id: keyof ServiceInvoiceLineEntry;
	kind: ServiceInvoiceServiceDetailColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type ServiceInvoiceServiceDetailUpdater = (
	rowId: string,
	updates: Partial<ServiceInvoiceLineEntry>,
) => void;

export function createServiceInvoiceServiceDetailColumns(
	isReadonly: boolean,
	onUpdateEntry: ServiceInvoiceServiceDetailUpdater,
	lineErrors: Record<
		string,
		Partial<Record<keyof ServiceInvoiceLineEntry, string>>
	> = {},
): ModuleDataEntryColumn<ServiceInvoiceLineEntry>[] {
	return ServiceInvoiceServiceDetailColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<ServiceInvoiceEntryCell
				column={column}
				fieldId={context.fieldId}
				fieldName={context.fieldName}
				isInvalid={Boolean(lineErrors[row.id]?.[column.id])}
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
	isInvalid,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: ServiceInvoiceServiceDetailColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	isInvalid: boolean;
	onUpdateEntry: ServiceInvoiceServiceDetailUpdater;
	row: ServiceInvoiceLineEntry;
}) {
	const value = String(row[column.id]);

	if (column.kind === "boolean") {
		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				className={EntryDropdownClassName}
				value={value}
				options={VatInclusiveOptions}
				placeholder=""
				isClearable={false}
				isSearchable={false}
				readOnly={isReadonly}
				onChange={(nextValue) => {
					const vatInclusive = String(nextValue) === "True" ? "True" : "False";
					onUpdateEntry(row.id, {
						vatAmount: vatInclusive === "True" ? row.vatAmount : "0.00",
						vatInclusive,
					});
				}}
			/>
		);
	}

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
		const isCalculatedAmount =
			column.id === "netAmount" ||
			column.id === "vatAmount" ||
			column.id === "discountAmount";

		return (
			<EntryAmountInput
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly || isCalculatedAmount}
				isInvalid={isInvalid}
				onValueChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: nextValue })
				}
			/>
		);
	}

	return (
		<ServiceInvoiceEntryTextInput
			id={fieldId}
			name={fieldName}
			value={value}
			readOnly={isReadonly}
			isInvalid={isInvalid}
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

function EntryAmountInput({
	id,
	isInvalid,
	name,
	onValueChange,
	readOnly,
	value,
}: {
	id: string;
	isInvalid: boolean;
	name: string;
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<ServiceInvoiceEntryAmountInput
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			isInvalid={isInvalid}
			onValueChange={onValueChange}
		/>
	);
}

const ServiceInvoiceServiceDetailColumnConfigs = [
	column(
		"Professional Service Type",
		"description",
		"dropdown",
		260,
		"w-[16.25rem]",
		ServiceInvoiceDescriptionOptions,
	),
	column("Amount", "amount", "amount", 120, "w-[7.5rem]"),
	column("QTY", "quantity", "amount", 100, "w-[6.25rem]"),
	column("Gross Amount", "netAmount", "amount", 140, "w-[8.75rem]"),
	column("VAT", "vatAmount", "amount", 120, "w-[7.5rem]"),
	column("VAT Inc.", "vatInclusive", "boolean", 110, "w-[6.875rem]"),
	column("Discount", "discountPercent", "amount", 120, "w-[7.5rem]"),
	column("Total Discount", "discountAmount", "amount", 145, "w-[9.0625rem]"),
	column("Net Amount", "grossAmount", "amount", 140, "w-[8.75rem]"),
];

const VatInclusiveOptions: AppAdvancedDropdownOption[] = [
	{ name: "True", value: "True" },
	{ name: "False", value: "False" },
];

function column(
	header: string,
	id: keyof ServiceInvoiceLineEntry,
	kind: ServiceInvoiceServiceDetailColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): ServiceInvoiceServiceDetailColumnConfig {
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
