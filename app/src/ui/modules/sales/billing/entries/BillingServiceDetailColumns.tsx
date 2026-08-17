import {
	BillingDescriptionOptions,
} from "@/app/src/data/modules/sales/billing/BillingData";
import type { BillingLineEntry } from "@/app/src/types/modules/sales/billing/BillingTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	BillingEntryAmountInput,
	BillingEntryTextInput,
} from "@/app/src/ui/modules/sales/billing/entries/BillingEntryCellControls";

type BillingServiceDetailColumnKind =
	| "amount"
	| "boolean"
	| "dropdown"
	| "text";

type BillingServiceDetailColumnConfig = {
	header: string;
	id: keyof BillingLineEntry;
	kind: BillingServiceDetailColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type BillingServiceDetailUpdater = (
	rowId: string,
	updates: Partial<BillingLineEntry>,
) => void;

export function createBillingServiceDetailColumns(
	isReadonly: boolean,
	onUpdateEntry: BillingServiceDetailUpdater,
	lineErrors: Record<
		string,
		Partial<Record<keyof BillingLineEntry, string>>
	> = {},
): ModuleDataEntryColumn<BillingLineEntry>[] {
	return BillingServiceDetailColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<BillingEntryCell
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

function BillingEntryCell({
	column,
	fieldId,
	fieldName,
	isInvalid,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: BillingServiceDetailColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	isInvalid: boolean;
	onUpdateEntry: BillingServiceDetailUpdater;
	row: BillingLineEntry;
}) {
	const value = String(row[column.id]);

	if (column.kind === "boolean") {
		const isVatInclusive = column.id === "vatInclusive";
		const isVatInclusiveDisabled =
			isVatInclusive && row.vatable.toLowerCase() !== "true";

		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				className={EntryDropdownClassName}
				value={value}
				options={BooleanOptions}
				placeholder=""
				isClearable={false}
				isSearchable={false}
				readOnly={isReadonly || isVatInclusiveDisabled}
				onChange={(nextValue) => {
					const booleanValue = String(nextValue) === "True" ? "True" : "False";

					if (column.id === "vatable") {
						onUpdateEntry(row.id, {
							vatable: booleanValue,
							...(booleanValue === "False"
								? { vatInclusive: "False" }
								: {}),
						});
						return;
					}

					onUpdateEntry(row.id, { [column.id]: booleanValue });
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
			column.id === "discountAmount" ||
			column.id === "grossAmount";

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
		<BillingEntryTextInput
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
		<BillingEntryAmountInput
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			isInvalid={isInvalid}
			onValueChange={onValueChange}
		/>
	);
}

const BillingServiceDetailColumnConfigs = [
	column(
		"Professional Service Type",
		"description",
		"dropdown",
		260,
		"w-[16.25rem]",
		BillingDescriptionOptions,
	),
	column("Amount", "amount", "amount", 120, "w-[7.5rem]"),
	column("QTY", "quantity", "amount", 100, "w-[6.25rem]"),
	column("Gross Amount", "netAmount", "amount", 140, "w-[8.75rem]"),
	column("VAT Amount", "vatAmount", "amount", 130, "w-[8.125rem]"),
	column("VATable", "vatable", "boolean", 110, "w-[6.875rem]"),
	column("VAT Inc.", "vatInclusive", "boolean", 110, "w-[6.875rem]"),
	column(
		"Discount Maintenance",
		"discountPercent",
		"amount",
		180,
		"w-[11.25rem]",
	),
	column("Total Discount", "discountAmount", "amount", 145, "w-[9.0625rem]"),
	column("Net Amount", "grossAmount", "amount", 140, "w-[8.75rem]"),
];

const BooleanOptions: AppAdvancedDropdownOption[] = [
	{ name: "True", value: "True" },
	{ name: "False", value: "False" },
];

function column(
	header: string,
	id: keyof BillingLineEntry,
	kind: BillingServiceDetailColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): BillingServiceDetailColumnConfig {
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
