import { useCallback, useMemo } from "react";
import {
	createBlankPickListLineEntry,
	pickListEntryHasData,
	pickListEntryIsComplete,
} from "@/app/src/data/modules/inventory/pick-list/PickListData";
import type { PickListLineEntry } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createPickListEntryColumns } from "@/app/src/ui/modules/inventory/pick-list/PickListEntryColumns";

type PickListEntriesProps = {
	isReadonly: boolean;
	rows: PickListLineEntry[];
	onRowsChange: (rows: PickListLineEntry[]) => void;
};

export function PickListEntries({
	isReadonly,
	onRowsChange,
	rows,
}: PickListEntriesProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<PickListLineEntry>) => {
			onRowsChange(
				rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
			);
		},
		[onRowsChange, rows],
	);
	const columns = useMemo<ModuleDataEntryColumn<PickListLineEntry>[]>(
		() => createPickListEntryColumns(isReadonly, updateEntry),
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
		onRowsChange([
			...rows,
			...Array.from({ length: count }, () => createBlankPickListLineEntry()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankPickListLineEntry()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(nextRows.length > 0 ? nextRows : [createBlankPickListLineEntry()]);
	}

	function duplicateRow(rowId: string) {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		const row = rows[rowIndex];

		if (!row) {
			return;
		}

		const nextRows = [...rows];
		nextRows.splice(rowIndex + 1, 0, {
			...row,
			id: createBlankPickListLineEntry().id,
		});
		onRowsChange(nextRows);
	}

	function insertRow(rowId: string, position: "above" | "below") {
		const rowIndex = rows.findIndex((row) => row.id === rowId);

		if (rowIndex < 0) {
			return;
		}

		const nextRows = [...rows];
		nextRows.splice(
			position === "above" ? rowIndex : rowIndex + 1,
			0,
			createBlankPickListLineEntry(),
		);
		onRowsChange(nextRows);
	}

	function moveRow(fromRowId: string, toRowId: string) {
		const fromIndex = rows.findIndex((row) => row.id === fromRowId);
		const toIndex = rows.findIndex((row) => row.id === toRowId);

		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
			return;
		}

		const nextRows = [...rows];
		const [movedRow] = nextRows.splice(fromIndex, 1);

		if (!movedRow) {
			return;
		}

		nextRows.splice(toIndex, 0, movedRow);
		onRowsChange(nextRows);
	}

	function removeRow(rowId: string) {
		const nextRows = rows.filter((row) => row.id !== rowId);
		onRowsChange(nextRows.length > 0 ? nextRows : [createBlankPickListLineEntry()]);
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

function shouldClearEntry(
	entry: PickListLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return pickListEntryHasData(entry);
	}

	if (action === "incomplete") {
		return pickListEntryHasData(entry) && !pickListEntryIsComplete(entry);
	}

	return !pickListEntryHasData(entry);
}
