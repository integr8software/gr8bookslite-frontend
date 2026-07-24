import {
	DeliveryReceiptResponsibilityCenterOptions,
	DeliveryReceiptUomOptions,
	DeliveryReceiptWarehouseOptions,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptLineEntry } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	DeliveryReceiptEntryAmountInput,
	DeliveryReceiptEntryTextInput,
} from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptEntryCellControls";

type DeliveryReceiptEntryColumnKind = "amount" | "dropdown" | "text";

type DeliveryReceiptEntryColumnConfig = {
	header: string;
	id: keyof DeliveryReceiptLineEntry;
	kind: DeliveryReceiptEntryColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type DeliveryReceiptEntryUpdater = (
	rowId: string,
	updates: Partial<DeliveryReceiptLineEntry>,
) => void;

export function createDeliveryReceiptLineColumns(
	isReadonly: boolean,
	onUpdateEntry: DeliveryReceiptEntryUpdater,
): ModuleDataEntryColumn<DeliveryReceiptLineEntry>[] {
	return DeliveryReceiptEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<DeliveryReceiptEntryCell
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

function DeliveryReceiptEntryCell({
	column,
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: DeliveryReceiptEntryColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: DeliveryReceiptEntryUpdater;
	row: DeliveryReceiptLineEntry;
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
		<DeliveryReceiptEntryTextInput
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
		<DeliveryReceiptEntryAmountInput
			id={id}
			name={name}
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
		/>
	);
}

const DeliveryReceiptEntryColumnConfigs = [
	column("Item Code", "itemCode", "text", 130, "w-[8rem]"),
	column("Barcode", "barcode", "text", 130, "w-[8rem]"),
	column("Name", "name", "text", 240, "w-[15rem]"),
	column("Description", "description", "text", 260, "w-[16rem]"),
	column("Serial No.", "serialNo", "text", 200, "w-[12.5rem]"),
	column("Qty", "quantity", "amount", 110, "w-[7rem]"),
	column("UOM", "uom", "dropdown", 130, "w-[8rem]", DeliveryReceiptUomOptions),
	column("LotNo", "lotNo", "text", 130, "w-[8rem]"),
	column(
		"Warehouse",
		"warehouse",
		"dropdown",
		210,
		"w-[13rem]",
		DeliveryReceiptWarehouseOptions,
	),
	column("Stock Qty", "stockQuantity", "amount", 120, "w-[7.5rem]"),
	column(
		"Res. Center",
		"responsibilityCenter",
		"dropdown",
		210,
		"w-[13rem]",
		DeliveryReceiptResponsibilityCenterOptions,
	),
	column("Remarks", "particulars", "text", 260, "w-[16rem]"),
];

function column(
	header: string,
	id: keyof DeliveryReceiptLineEntry,
	kind: DeliveryReceiptEntryColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): DeliveryReceiptEntryColumnConfig {
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
