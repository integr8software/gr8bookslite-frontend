import { useCallback, useMemo, useState } from "react";
import {
	calculateGoodsReceiptTotals,
	createBlankGoodsReceiptAccountingEntry,
	createBlankGoodsReceiptLineEntry,
	formatGoodsReceiptAmount,
	goodsReceiptEntryHasData,
	goodsReceiptEntryIsComplete,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type {
	GoodsReceiptAccountingColumnId,
	GoodsReceiptAccountingEntry,
	GoodsReceiptEntryTab,
	GoodsReceiptLineEntry,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { createGoodsReceiptAccountingEntryColumns } from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptAccountingEntryColumns";
import {
	GoodsReceiptAccountingDefaultVisibleColumnIds,
	GoodsReceiptAccountingProtectedColumnIds,
} from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptAccountingEntryColumns";
import { GoodsReceiptEntryTabs } from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptEntryTabs";
import { createGoodsReceiptLineColumns } from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptLineColumns";

type GoodsReceiptEntrySectionProps = {
	accountingRows: GoodsReceiptAccountingEntry[];
	isReadonly: boolean;
	rows: GoodsReceiptLineEntry[];
	onAccountingRowsChange: (rows: GoodsReceiptAccountingEntry[]) => void;
	onRowsChange: (rows: GoodsReceiptLineEntry[]) => void;
};

export function GoodsReceiptEntrySection({
	accountingRows,
	isReadonly,
	onAccountingRowsChange,
	onRowsChange,
	rows,
}: GoodsReceiptEntrySectionProps) {
	const [activeTab, setActiveTab] = useState<GoodsReceiptEntryTab>("goods");
	const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
		GoodsReceiptAccountingColumnId[]
	>([...GoodsReceiptAccountingDefaultVisibleColumnIds]);
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
	const updateAccountingEntry = useCallback(
		(
			rowId: string,
			updates: Partial<Omit<GoodsReceiptAccountingEntry, "id">>,
		) => {
			onAccountingRowsChange(
				accountingRows.map((row) =>
					row.id === rowId ? { ...row, ...updates } : row,
				),
			);
		},
		[accountingRows, onAccountingRowsChange],
	);
	const totals = useMemo(() => calculateGoodsReceiptTotals(rows), [rows]);
	const columns = useMemo<ModuleDataEntryColumn<GoodsReceiptLineEntry>[]>(
		() => createGoodsReceiptLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const accountingColumns = useMemo(
		() =>
			createGoodsReceiptAccountingEntryColumns(
				isReadonly,
				updateAccountingEntry,
			),
		[isReadonly, updateAccountingEntry],
	);
	const visibleAccountingColumns = useMemo(
		() =>
			accountingColumns.filter((column) =>
				visibleAccountingColumnIds.includes(
					column.id as GoodsReceiptAccountingColumnId,
				),
			),
		[accountingColumns, visibleAccountingColumnIds],
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

	if (activeTab === "accounting") {
		return (
			<ModuleDataEntry
				columns={visibleAccountingColumns}
				columnOptions={createAccountingColumnOptions(
					accountingColumns,
					visibleAccountingColumnIds,
				)}
				description=""
				emptyRowLabel="entry"
				exportOptions={EntryExportOptions}
				isDraggable
				isReadonly={isReadonly}
				rows={accountingRows}
				summaryCells={createAccountingSummaryCells(accountingRows)}
				title={
					<GoodsReceiptEntryTabs
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>
				}
				onAddRows={(count) =>
					onAccountingRowsChange([
						...accountingRows,
						...Array.from({ length: count }, () =>
							createBlankGoodsReceiptAccountingEntry(),
						),
					])
				}
				onAutoColumnWidth={() => undefined}
				onClearRows={(action) =>
					onAccountingRowsChange(clearAccountingRows(accountingRows, action))
				}
				onDuplicateRow={(rowId) =>
					onAccountingRowsChange(
						duplicateEntryRow(
							accountingRows,
							rowId,
							() => createBlankGoodsReceiptAccountingEntry().id,
						),
					)
				}
				onFitColumnWidth={() => undefined}
				onImport={() => undefined}
				onInsertRow={(rowId, position) =>
					onAccountingRowsChange(
						insertEntryRow(
							accountingRows,
							rowId,
							position,
							createBlankGoodsReceiptAccountingEntry,
						),
					)
				}
				onMoveRow={(fromRowId, toRowId) =>
					onAccountingRowsChange(
						moveEntryRow(accountingRows, fromRowId, toRowId),
					)
				}
				onRemoveRow={(rowId) =>
					onAccountingRowsChange(
						removeEntryRow(
							accountingRows,
							rowId,
							createBlankGoodsReceiptAccountingEntry,
						),
					)
				}
				onToggleColumnVisibility={(columnId, isVisible) =>
					setVisibleAccountingColumnIds((current) =>
						toggleAccountingColumnVisibility(
							current,
							columnId as GoodsReceiptAccountingColumnId,
							isVisible,
						),
					)
				}
				onUpdateColumnHeader={() => undefined}
				onUpdateColumnWidth={() => undefined}
			/>
		);
	}

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
			exportOptions={EntryExportOptions}
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
			title={
				<GoodsReceiptEntryTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
			}
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

function createAccountingColumnOptions(
	columns: ModuleDataEntryColumn<GoodsReceiptAccountingEntry>[],
	visibleColumnIds: GoodsReceiptAccountingColumnId[],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: !GoodsReceiptAccountingProtectedColumnIds.has(
			column.id as GoodsReceiptAccountingColumnId,
		),
		isVisible: visibleColumnIds.includes(
			column.id as GoodsReceiptAccountingColumnId,
		),
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}

function toggleAccountingColumnVisibility(
	current: GoodsReceiptAccountingColumnId[],
	columnId: GoodsReceiptAccountingColumnId,
	isVisible: boolean,
) {
	if (GoodsReceiptAccountingProtectedColumnIds.has(columnId)) {
		return current;
	}

	if (isVisible) {
		return current.includes(columnId) ? current : [...current, columnId];
	}

	return current.filter((currentColumnId) => currentColumnId !== columnId);
}

function createAccountingSummaryCells(rows: GoodsReceiptAccountingEntry[]) {
	const totals = rows.reduce(
		(summary, entry) => ({
			credit: summary.credit + entry.credit,
			debit: summary.debit + entry.debit,
		}),
		{ credit: 0, debit: 0 },
	);

	return {
		accountTitle: "Totals",
		credit: formatGoodsReceiptAmount(totals.credit),
		debit: formatGoodsReceiptAmount(totals.debit),
	};
}

function clearAccountingRows(
	rows: GoodsReceiptAccountingEntry[],
	action: ModuleDataEntryClearAction,
) {
	if (action === "all") {
		return [createBlankGoodsReceiptAccountingEntry()];
	}

	const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));

	return nextRows.length > 0
		? nextRows
		: [createBlankGoodsReceiptAccountingEntry()];
}

function shouldClearAccountingEntry(
	entry: GoodsReceiptAccountingEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData =
		entry.accountCode.trim() !== "" ||
		entry.accountTitle.trim() !== "" ||
		entry.partyCode.trim() !== "" ||
		entry.partyName.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		entry.vatType.trim() !== "" ||
		entry.atcCode.trim() !== "" ||
		entry.responsibilityCenter.trim() !== "" ||
		entry.refNo.trim() !== "" ||
		entry.debit > 0 ||
		entry.credit > 0;

	if (action === "with-data") return hasData;
	if (action === "incomplete") return hasData && !entry.accountTitle.trim();

	return !hasData;
}

function duplicateEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	createId: () => string,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) return rows;

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, { ...row, id: createId() });
	return nextRows;
}

function insertEntryRow<TRow>(
	rows: TRow[],
	rowId: string,
	position: "above" | "below",
	createRow: () => TRow,
) {
	const rowIndex = rows.findIndex((row) => getRowId(row) === rowId);
	const insertIndex =
		rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
	const nextRows = [...rows];

	nextRows.splice(insertIndex, 0, createRow());
	return nextRows;
}

function moveEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	fromRowId: string,
	toRowId: string,
) {
	const fromIndex = rows.findIndex((row) => row.id === fromRowId);
	const toIndex = rows.findIndex((row) => row.id === toRowId);

	if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return rows;

	const nextRows = [...rows];
	const [movedRow] = nextRows.splice(fromIndex, 1);

	if (!movedRow) return rows;

	nextRows.splice(toIndex, 0, movedRow);
	return nextRows;
}

function removeEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	createFallbackRow: () => TRow,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);

	return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

function getRowId(row: unknown) {
	return typeof row === "object" && row !== null && "id" in row
		? String(row.id)
		: "";
}

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];

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
