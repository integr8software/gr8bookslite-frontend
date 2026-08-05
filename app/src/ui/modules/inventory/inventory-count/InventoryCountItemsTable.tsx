"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
	createInventoryCountLine,
	recalculateInventoryCountLine,
} from "@/app/src/data/modules/inventory/inventory-count/InventoryCountData";
import type { InventoryCountLine } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

type InventoryCountColumnKey = keyof Omit<InventoryCountLine, "id" | "remarks">;

type InventoryCountColumnConfig = {
	header: string;
	id: InventoryCountColumnKey;
	isNumeric?: boolean;
	isReadonly?: boolean;
	width: number;
	widthClassName: string;
};

const InventoryCountColumnConfigs = [
	columnConfig("Item Code *", "itemCode", 140, "w-[8.75rem]"),
	columnConfig("Barcode", "barcode", 130, "w-[8rem]"),
	columnConfig("Item Name *", "itemName", 220, "w-[13.75rem]"),
	columnConfig("Stock Qty", "systemQty", 110, "w-[7rem]", true, true),
	columnConfig("UOM *", "uom", 105, "w-[6.5rem]"),
	columnConfig("Inventory Count", "countQty", 135, "w-[8.5rem]", true),
	columnConfig("Variance", "variance", 120, "w-[7.5rem]", true, true),
	columnConfig("Expiration Date", "expiryDate", 130, "w-[8rem]"),
	columnConfig("Lot No", "lotNo", 110, "w-[7rem]"),
	columnConfig("Serial No.", "serialNumber", 130, "w-[8rem]"),
	columnConfig("Res Center", "responsibilityCenter", 140, "w-[8.75rem]"),
	columnConfig("Color", "color", 100, "w-[6.25rem]"),
	columnConfig("Brand", "brand", 110, "w-[7rem]"),
	columnConfig("Size", "size", 90, "w-[5.75rem]"),
	columnConfig("Model", "model", 110, "w-[7rem]"),
] satisfies InventoryCountColumnConfig[];

const DefaultVisibleInventoryCountColumns = new Set<string>([
	"itemCode",
	"itemName",
	"systemQty",
	"uom",
	"countQty",
	"variance",
]);

const RequiredInventoryCountColumns = new Set<string>([
	"itemCode",
	"itemName",
	"systemQty",
	"uom",
	"countQty",
	"variance",
]);

export function InventoryCountItemsTable({
	isReadonly,
	onRowsChange,
	rows,
}: {
	isReadonly: boolean;
	onRowsChange: (rows: InventoryCountLine[]) => void;
	rows: InventoryCountLine[];
}) {
	const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(
		() => new Set(DefaultVisibleInventoryCountColumns),
	);
	const totalVariance = rows.reduce(
		(total, row) => total + (Number.parseFloat(row.variance) || 0),
		0,
	);
	const columns = useMemo<ModuleDataEntryColumn<InventoryCountLine>[]>(
		() => createInventoryCountColumns(isReadonly, updateEntry),
		[isReadonly, rows],
	);
	const visibleColumns = useMemo(
		() => columns.filter((column) => visibleColumnIds.has(column.id)),
		[columns, visibleColumnIds],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !RequiredInventoryCountColumns.has(column.id),
				isVisible: visibleColumnIds.has(column.id),
				label: column.header,
				width: column.width,
				widthMode: column.widthMode,
			})),
		[columns, visibleColumnIds],
	);

	function updateEntry(rowId: string, field: InventoryCountColumnKey, value: string) {
		if (isReadonly || field === "systemQty" || field === "variance") {
			return;
		}

		onRowsChange(
			rows.map((row) =>
				row.id === rowId ? recalculateInventoryCountLine({ ...row, [field]: value }) : row,
			),
		);
	}

	function toggleColumnVisibility(columnId: string, isVisible: boolean) {
		if (!isVisible && RequiredInventoryCountColumns.has(columnId)) {
			return;
		}

		setVisibleColumnIds((current) => {
			const next = new Set(current);
			isVisible ? next.add(columnId) : next.delete(columnId);
			return next;
		});
	}

	function addRows(count: number) {
		onRowsChange([...rows, ...Array.from({ length: count }, () => createInventoryCountLine())]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createInventoryCountLine()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearInventoryCountLine(row, action));
		onRowsChange(nextRows.length > 0 ? nextRows : [createInventoryCountLine()]);
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
			id: createInventoryCountLine().id,
		});
		onRowsChange(nextRows);
	}

	function insertRow(rowId: string, position: "above" | "below") {
		const rowIndex = rows.findIndex((row) => row.id === rowId);

		if (rowIndex < 0) {
			return;
		}

		const nextRows = [...rows];
		nextRows.splice(position === "above" ? rowIndex : rowIndex + 1, 0, createInventoryCountLine());
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
		onRowsChange(nextRows.length > 0 ? nextRows : [createInventoryCountLine()]);
	}

	return (
		<ModuleDataEntry
			canConfigureColumnsWhenReadonly
			columns={visibleColumns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="item"
			footerDetails={
				<span className="text-sm font-semibold text-darknavy">
					Total Variance: {totalVariance.toFixed(2)}
				</span>
			}
			isReadonly
			rows={rows}
			summaryCells={{ variance: totalVariance.toFixed(2) }}
			summaryRowHeader="Total"
			title="Inventory Count Items"
			onAddRows={addRows}
			onAutoColumnWidth={() => undefined}
			onClearRows={clearRows}
			onDuplicateRow={duplicateRow}
			onFitColumnWidth={() => undefined}
			onInsertRow={insertRow}
			onMoveRow={moveRow}
			onRemoveRow={removeRow}
			onToggleColumnVisibility={toggleColumnVisibility}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function createInventoryCountColumns(
	isReadonly: boolean,
	onUpdateEntry: (rowId: string, field: InventoryCountColumnKey, value: string) => void,
): ModuleDataEntryColumn<InventoryCountLine>[] {
	return InventoryCountColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		isRemovable: !RequiredInventoryCountColumns.has(column.id),
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<input
				readOnly={isReadonly || column.isReadonly}
				value={row[column.id]}
				onChange={(event) => onUpdateEntry(row.id, column.id, event.target.value)}
				className={getInventoryCountCellClassName(column.isNumeric)}
				type="text"
			/>
		),
	}));
}

function columnConfig(
	header: string,
	id: InventoryCountColumnKey,
	width: number,
	widthClassName: string,
	isNumeric = false,
	isReadonly = false,
): InventoryCountColumnConfig {
	return { header, id, isNumeric, isReadonly, width, widthClassName };
}

function shouldClearInventoryCountLine(
	line: InventoryCountLine,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData = inventoryCountLineHasData(line);

	if (action === "with-data") {
		return hasData;
	}

	if (action === "incomplete") {
		return hasData && (!line.itemCode.trim() || !line.itemName.trim());
	}

	return !hasData;
}

function inventoryCountLineHasData(line: InventoryCountLine) {
	return Object.entries(line).some(([key, value]) => {
		if (key === "id") {
			return false;
		}

		return String(value).trim().length > 0 && String(value) !== "0.00";
	});
}

function getInventoryCountCellClassName(isNumeric?: boolean) {
	return [
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:cursor-default",
		isNumeric ? "text-right tabular-nums" : "",
	].join(" ");
}

export function TableHeaderCell({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<th className={`h-9 border-r border-white/20 px-2 py-1.5 text-xs font-semibold last:border-r-0 ${className}`}>
			{children}
		</th>
	);
}

export function TableCell({
	children,
	className = "",
}: {
	children?: ReactNode;
	className?: string;
}) {
	return (
		<td className={`h-9 border-r border-darknavy/10 px-2 py-1.5 last:border-r-0 ${className}`}>
			{children}
		</td>
	);
}
