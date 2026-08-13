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

type BillingServiceDetailColumnKind = "amount" | "dropdown" | "text";

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
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: BillingServiceDetailColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: BillingServiceDetailUpdater;
	row: BillingLineEntry;
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
		<BillingEntryTextInput
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
		<BillingEntryAmountInput
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
		/>
	);
}

const BillingServiceDetailColumnConfigs = [
	column(
		"Billing Type",
		"description",
		"dropdown",
		260,
		"w-[16.25rem]",
		BillingDescriptionOptions,
	),
	column("Rate", "amount", "amount", 120, "w-[7.5rem]"),
	column("Qty", "quantity", "amount", 100, "w-[6.25rem]"),
	column("Amount", "netAmount", "amount", 130, "w-[8rem]"),
	column("VAT", "vatAmount", "amount", 120, "w-[7.5rem]"),
	column("VAT Inc.", "wvatAmount", "amount", 130, "w-[8rem]"),
	column("Disct", "discountAmount", "amount", 120, "w-[7.5rem]"),
	column("Net Amt", "grossAmount", "amount", 130, "w-[8rem]"),
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
