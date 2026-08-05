import { useCallback, useMemo, useState } from "react";
import {
	calculateDeliveryReceiptTotalQuantity,
	createBlankDeliveryReceiptAccountingEntry,
	formatDeliveryReceiptQuantity,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type {
	DeliveryReceiptAccountingEntry,
	DeliveryReceiptLineEntry,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createDeliveryReceiptAccountingEntryColumns } from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptAccountingEntryColumns";
import {
	DeliveryReceiptAccountingDefaultVisibleColumnIds,
	DeliveryReceiptAccountingProtectedColumnIds,
	type DeliveryReceiptAccountingColumnId,
} from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptAccountingEntryColumns";
import {
	DeliveryReceiptEntryTabs,
	type DeliveryReceiptEntryTab,
} from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptEntryTabs";
import { createDeliveryReceiptLineColumns } from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptLineColumns";
import {
	clearDeliveryReceiptAccountingEntries,
	clearDeliveryReceiptLines,
	createDeliveryReceiptAccountingEntryRows,
	createDeliveryReceiptLineEntries,
	duplicateEntryRow,
	duplicateDeliveryReceiptLine,
	insertEntryRow,
	insertDeliveryReceiptLine,
	moveEntryRow,
	moveDeliveryReceiptLine,
	removeEntryRow,
	removeDeliveryReceiptLine,
} from "@/app/src/ui/modules/inventory/delivery-receipt/entries/utils/DeliveryReceiptEntryRowUtils";

type DeliveryReceiptEntrySectionProps = {
	accountingRows: DeliveryReceiptAccountingEntry[];
	isReadonly: boolean;
	rows: DeliveryReceiptLineEntry[];
	onAccountingRowsChange: (rows: DeliveryReceiptAccountingEntry[]) => void;
	onRowsChange: (rows: DeliveryReceiptLineEntry[]) => void;
};

export function DeliveryReceiptEntrySection({
	accountingRows,
	isReadonly,
	onAccountingRowsChange,
	onRowsChange,
	rows,
}: DeliveryReceiptEntrySectionProps) {
	const [activeTab, setActiveTab] = useState<DeliveryReceiptEntryTab>("delivery");
	const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
		DeliveryReceiptAccountingColumnId[]
	>([...DeliveryReceiptAccountingDefaultVisibleColumnIds]);
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<DeliveryReceiptLineEntry>) => {
			onRowsChange(
				rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
			);
		},
		[onRowsChange, rows],
	);
	const updateAccountingEntry = useCallback(
		(
			rowId: string,
			updates: Partial<Omit<DeliveryReceiptAccountingEntry, "id">>,
		) => {
			onAccountingRowsChange(
				accountingRows.map((row) =>
					row.id === rowId ? { ...row, ...updates } : row,
				),
			);
		},
		[accountingRows, onAccountingRowsChange],
	);
	const totalQuantity = useMemo(
		() => calculateDeliveryReceiptTotalQuantity(rows),
		[rows],
	);
	const columns = useMemo<ModuleDataEntryColumn<DeliveryReceiptLineEntry>[]>(
		() => createDeliveryReceiptLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const accountingColumns = useMemo(
		() =>
			createDeliveryReceiptAccountingEntryColumns(
				isReadonly,
				updateAccountingEntry,
			),
		[isReadonly, updateAccountingEntry],
	);
	const visibleAccountingColumns = useMemo(
		() =>
			accountingColumns.filter((column) =>
				visibleAccountingColumnIds.includes(
					column.id as DeliveryReceiptAccountingColumnId,
				),
			),
		[accountingColumns, visibleAccountingColumnIds],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "name", "quantity"].includes(column.id),
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
					<DeliveryReceiptEntryTabs
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>
				}
				onAddRows={(count) =>
					onAccountingRowsChange([
						...accountingRows,
						...createDeliveryReceiptAccountingEntryRows(count),
					])
				}
				onAutoColumnWidth={() => undefined}
				onClearRows={(action) =>
					onAccountingRowsChange(
						clearDeliveryReceiptAccountingEntries(accountingRows, action),
					)
				}
				onDuplicateRow={(rowId) =>
					onAccountingRowsChange(
						duplicateEntryRow(
							accountingRows,
							rowId,
							() => createBlankDeliveryReceiptAccountingEntry().id,
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
							createBlankDeliveryReceiptAccountingEntry,
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
							createBlankDeliveryReceiptAccountingEntry,
						),
					)
				}
				onToggleColumnVisibility={(columnId, isVisible) =>
					setVisibleAccountingColumnIds((current) =>
						toggleAccountingColumnVisibility(
							current,
							columnId as DeliveryReceiptAccountingColumnId,
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
		onRowsChange([...rows, ...createDeliveryReceiptLineEntries(count)]);
	}

	function duplicateRow(rowId: string) {
		onRowsChange(duplicateDeliveryReceiptLine(rows, rowId));
	}

	function insertRow(rowId: string, position: "above" | "below") {
		onRowsChange(insertDeliveryReceiptLine(rows, rowId, position));
	}

	function moveRow(fromRowId: string, toRowId: string) {
		onRowsChange(moveDeliveryReceiptLine(rows, fromRowId, toRowId));
	}

	function removeRow(rowId: string) {
		onRowsChange(removeDeliveryReceiptLine(rows, rowId));
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="delivery line"
			exportOptions={EntryExportOptions}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Total Qty: {formatDeliveryReceiptQuantity(totalQuantity)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				quantity: formatDeliveryReceiptQuantity(totalQuantity),
			}}
			title={
				<DeliveryReceiptEntryTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
			}
			onAddRows={addRows}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) =>
				onRowsChange(clearDeliveryReceiptLines(rows, action))
			}
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
	columns: ModuleDataEntryColumn<DeliveryReceiptAccountingEntry>[],
	visibleColumnIds: DeliveryReceiptAccountingColumnId[],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: !DeliveryReceiptAccountingProtectedColumnIds.has(
			column.id as DeliveryReceiptAccountingColumnId,
		),
		isVisible: visibleColumnIds.includes(
			column.id as DeliveryReceiptAccountingColumnId,
		),
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}

function toggleAccountingColumnVisibility(
	current: DeliveryReceiptAccountingColumnId[],
	columnId: DeliveryReceiptAccountingColumnId,
	isVisible: boolean,
) {
	if (DeliveryReceiptAccountingProtectedColumnIds.has(columnId)) {
		return current;
	}

	if (isVisible) {
		return current.includes(columnId) ? current : [...current, columnId];
	}

	return current.filter((currentColumnId) => currentColumnId !== columnId);
}

function createAccountingSummaryCells(rows: DeliveryReceiptAccountingEntry[]) {
	const totals = rows.reduce(
		(summary, entry) => ({
			credit: summary.credit + entry.credit,
			debit: summary.debit + entry.debit,
		}),
		{ credit: 0, debit: 0 },
	);

	return {
		accountTitle: "Totals",
		credit: formatDeliveryReceiptQuantity(totals.credit),
		debit: formatDeliveryReceiptQuantity(totals.debit),
	};
}

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
