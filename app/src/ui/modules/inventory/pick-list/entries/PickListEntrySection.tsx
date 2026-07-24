import { useCallback, useMemo } from "react";
import type { PickListLineEntry } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createPickListLineColumns } from "@/app/src/ui/modules/inventory/pick-list/entries/PickListLineColumns";
import {
	clearPickListLines,
	createPickListLineEntries,
	duplicatePickListLine,
	insertPickListLine,
	movePickListLine,
	removePickListLine,
} from "@/app/src/ui/modules/inventory/pick-list/entries/utils/PickListEntryRowUtils";

type PickListEntrySectionProps = {
	isReadonly: boolean;
	rows: PickListLineEntry[];
	onRowsChange: (rows: PickListLineEntry[]) => void;
};

export function PickListEntrySection({
	isReadonly,
	onRowsChange,
	rows,
}: PickListEntrySectionProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<PickListLineEntry>) => {
			onRowsChange(
				rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
			);
		},
		[onRowsChange, rows],
	);
	const columns = useMemo<ModuleDataEntryColumn<PickListLineEntry>[]>(
		() => createPickListLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: column.id !== "vceCode" && column.id !== "vceName",
				isVisible: true,
				label: column.header,
				width: column.width,
				widthMode: column.widthMode,
			})),
		[columns],
	);

	function addRows(count: number) {
		onRowsChange([...rows, ...createPickListLineEntries(count)]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		onRowsChange(clearPickListLines(rows, action));
	}

	function duplicateRow(rowId: string) {
		onRowsChange(duplicatePickListLine(rows, rowId));
	}

	function insertRow(rowId: string, position: "above" | "below") {
		onRowsChange(insertPickListLine(rows, rowId, position));
	}

	function moveRow(fromRowId: string, toRowId: string) {
		onRowsChange(movePickListLine(rows, fromRowId, toRowId));
	}

	function removeRow(rowId: string) {
		onRowsChange(removePickListLine(rows, rowId));
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="pick list line"
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>{rows.length} Pick list line{rows.length === 1 ? "" : "s"}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			title="Pick List Details"
			onAddRows={addRows}
			onAutoColumnWidth={() => undefined}
			onClearRows={clearRows}
			onDuplicateRow={duplicateRow}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={insertRow}
			onMoveRow={moveRow}
			onRemoveRow={removeRow}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}
