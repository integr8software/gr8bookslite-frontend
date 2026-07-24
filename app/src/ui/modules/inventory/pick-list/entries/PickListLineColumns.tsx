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
	column("Party Code", "vceCode", 170, "w-[10.5rem]"),
	column("Party Name", "vceName", 320, "w-[20rem]"),
	column("Remarks", "remarks", 360, "w-[22.5rem]"),
	column("RefNo", "referenceNo", 180, "w-[11.25rem]"),
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
