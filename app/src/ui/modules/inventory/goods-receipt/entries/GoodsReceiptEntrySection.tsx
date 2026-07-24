import { useCallback, useMemo } from "react";
import {
	calculateGoodsReceiptTotals,
	createBlankGoodsReceiptLineEntry,
	formatGoodsReceiptAmount,
	goodsReceiptEntryHasData,
	goodsReceiptEntryIsComplete,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type { GoodsReceiptLineEntry } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { createGoodsReceiptLineColumns } from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptLineColumns";

type GoodsReceiptEntrySectionProps = {
	isReadonly: boolean;
	rows: GoodsReceiptLineEntry[];
	onRowsChange: (rows: GoodsReceiptLineEntry[]) => void;
};

export function GoodsReceiptEntrySection({
	isReadonly,
	onRowsChange,
	rows,
}: GoodsReceiptEntrySectionProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<GoodsReceiptLineEntry>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId ? recalculateEntry({ ...row, ...updates }) : row,
				),
			);
		},
		[onRowsChange, rows],
	);
	const totals = useMemo(() => calculateGoodsReceiptTotals(rows), [rows]);
	const columns = useMemo<ModuleDataEntryColumn<GoodsReceiptLineEntry>[]>(
		() => createGoodsReceiptLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "itemName", "receivedQuantity"].includes(
					column.id,
				),
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
			...Array.from({ length: count }, () => createBlankGoodsReceiptLineEntry()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankGoodsReceiptLineEntry()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankGoodsReceiptLineEntry()],
		);
	}

	function duplicateRow(rowId: string) {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		const row = rows[rowIndex];

		if (!row) return;

		const nextRows = [...rows];
		nextRows.splice(rowIndex + 1, 0, {
			...row,
			id: createBlankGoodsReceiptLineEntry().id,
		});
		onRowsChange(nextRows);
	}

	function insertRow(rowId: string, position: "above" | "below") {
		const rowIndex = rows.findIndex((row) => row.id === rowId);

		if (rowIndex < 0) return;

		const nextRows = [...rows];
		nextRows.splice(
			position === "above" ? rowIndex : rowIndex + 1,
			0,
			createBlankGoodsReceiptLineEntry(),
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
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankGoodsReceiptLineEntry()],
		);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="goods receipt line"
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Received Qty: {formatGoodsReceiptAmount(totals.receivedQuantity)}</span>
					<span>Amount: {formatGoodsReceiptAmount(totals.amount)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				amount: formatGoodsReceiptAmount(totals.amount),
				receivedQuantity: formatGoodsReceiptAmount(totals.receivedQuantity),
			}}
			title="Goods Receipt Details"
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

function recalculateEntry(entry: GoodsReceiptLineEntry): GoodsReceiptLineEntry {
	const receivedQuantity = parseMoneyNumberInput(entry.receivedQuantity);
	const unitCost = parseMoneyNumberInput(entry.unitCost);

	return {
		...entry,
		amount:
			receivedQuantity > 0 && unitCost > 0
				? (receivedQuantity * unitCost).toFixed(2)
				: entry.amount,
	};
}

function shouldClearEntry(
	entry: GoodsReceiptLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") return goodsReceiptEntryHasData(entry);
	if (action === "incomplete") {
		return goodsReceiptEntryHasData(entry) && !goodsReceiptEntryIsComplete(entry);
	}

	return !goodsReceiptEntryHasData(entry);
}
