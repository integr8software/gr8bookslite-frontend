import type { PickListLineEntry } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { PickListEntryTextInput } from "@/app/src/ui/modules/inventory/pick-list/entries/PickListEntryCellControls";

type PickListEntryColumnConfig = {
	header: string;
	id: keyof PickListLineEntry;
	width: number;
	widthClassName: string;
};

type PickListEntryUpdater = (
	rowId: string,
	updates: Partial<PickListLineEntry>,
) => void;

export function createPickListLineColumns(
	isReadonly: boolean,
	onUpdateEntry: PickListEntryUpdater,
): ModuleDataEntryColumn<PickListLineEntry>[] {
	return PickListEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<PickListEntryTextInput
				id={context.fieldId}
				name={context.fieldName}
				value={String(row[column.id])}
				readOnly={isReadonly}
				onChange={(value) => onUpdateEntry(row.id, { [column.id]: value })}
			/>
		),
	}));
}

const PickListEntryColumnConfigs = [
	column("SO No", "soNo", 150, "w-[9.375rem]"),
	column("Item Code *", "itemCode", 150, "w-[9.375rem]"),
	column("Barcode", "barcode", 150, "w-[9.375rem]"),
	column("Item Name *", "itemName", 260, "w-[16.25rem]"),
	column("SO Qty", "soQuantity", 120, "w-[7.5rem]"),
	column("PL Qty *", "plQuantity", 120, "w-[7.5rem]"),
	column("UOM *", "uom", 110, "w-[6.875rem]"),
	column("Expiration Date", "expirationDate", 150, "w-[9.375rem]"),
	column("Lot No", "lotNo", 130, "w-[8.125rem]"),
	column("Color", "color", 120, "w-[7.5rem]"),
	column("Brand", "brand", 120, "w-[7.5rem]"),
	column("Size", "size", 110, "w-[6.875rem]"),
	column("Model", "model", 130, "w-[8.125rem]"),
	column("Bin No", "binNo", 130, "w-[8.125rem]"),
];

function column(
	header: string,
	id: keyof PickListLineEntry,
	width: number,
	widthClassName: string,
): PickListEntryColumnConfig {
	return {
		header,
		id,
		width,
		widthClassName,
	};
}
