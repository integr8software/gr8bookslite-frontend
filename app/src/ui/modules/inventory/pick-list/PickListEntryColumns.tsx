import type { PickListLineEntry } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

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

export function createPickListEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: PickListEntryUpdater,
): ModuleDataEntryColumn<PickListLineEntry>[] {
	return PickListEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<EntryInput
				value={String(row[column.id])}
				readOnly={isReadonly}
				onChange={(value) => onUpdateEntry(row.id, { [column.id]: value })}
			/>
		),
	}));
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

function entryCellControlClassName() {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
	);
}

const PickListEntryColumnConfigs = [
	column("VCECode", "vceCode", 170, "w-[10.5rem]"),
	column("VCEName", "vceName", 320, "w-[20rem]"),
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
