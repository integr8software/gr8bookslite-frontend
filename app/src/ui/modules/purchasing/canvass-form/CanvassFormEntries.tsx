import { useCallback, useMemo } from "react";
import {
	createBlankCanvassFormItem,
	createCanvassFormId,
	formatCanvassFormAmount,
	getCanvassFormTotal,
	normalizeCanvassFormItem,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormItem } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createCanvassFormEntryColumns } from "@/app/src/ui/modules/purchasing/canvass-form/CanvassFormEntryColumns";

type CanvassFormEntriesProps = {
	error?: string;
	isReadonly: boolean;
	rows: CanvassFormItem[];
	onRowsChange: (rows: CanvassFormItem[]) => void;
};

export function CanvassFormEntries({
	error,
	isReadonly,
	onRowsChange,
	rows,
}: CanvassFormEntriesProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<CanvassFormItem>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId
						? normalizeCanvassFormItem({ ...row, ...updates })
						: row,
				),
			);
		},
		[onRowsChange, rows],
	);
	const total = useMemo(() => getCanvassFormTotal({ items: rows }), [rows]);
	const columns = useMemo<ModuleDataEntryColumn<CanvassFormItem>[]>(
		() => createCanvassFormEntryColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "description", "quantity"].includes(column.id),
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
			...Array.from({ length: count }, () => createBlankCanvassFormItem()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankCanvassFormItem()]);
			return;
		}
		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(nextRows.length ? nextRows : [createBlankCanvassFormItem()]);
	}

	function duplicateRow(rowId: string) {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		const row = rows[rowIndex];
		if (!row) return;
		const nextRows = [...rows];
		nextRows.splice(rowIndex + 1, 0, { ...row, id: createCanvassFormId("item") });
		onRowsChange(nextRows);
	}

	function insertRow(rowId: string, position: "above" | "below") {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		if (rowIndex < 0) return;
		const nextRows = [...rows];
		nextRows.splice(
			position === "above" ? rowIndex : rowIndex + 1,
			0,
			createBlankCanvassFormItem(),
		);
		onRowsChange(nextRows);
	}

	function moveRow(fromRowId: string, toRowId: string) {
		const fromIndex = rows.findIndex((row) => row.id === fromRowId);
		const toIndex = rows.findIndex((row) => row.id === toRowId);
		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
		const nextRows = [...rows];
		const [movedRow] = nextRows.splice(fromIndex, 1);
		if (!movedRow) return;
		nextRows.splice(toIndex, 0, movedRow);
		onRowsChange(nextRows);
	}

	function removeRow(rowId: string) {
		const nextRows = rows.filter((row) => row.id !== rowId);
		onRowsChange(nextRows.length ? nextRows : [createBlankCanvassFormItem()]);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="canvass line"
			error={error}
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="text-sm font-semibold text-darknavy">
					Total Cost: {formatCanvassFormAmount(total)}
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{ computedTotalCost: formatCanvassFormAmount(total) }}
			title="Items"
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
	entry: CanvassFormItem,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData = Boolean(
		entry.itemCode.trim() ||
			entry.barcode.trim() ||
			entry.description.trim() ||
			entry.supplierName1.trim() ||
			entry.supplierName2.trim() ||
			entry.supplierName3.trim() ||
			entry.supplierName4.trim() ||
			Number(entry.quantity),
	);
	const isComplete = Boolean(
		entry.itemCode.trim() && entry.description.trim() && entry.uom.trim(),
	);

	if (action === "with-data") return hasData;
	if (action === "incomplete") return hasData && !isComplete;
	return !hasData;
}
