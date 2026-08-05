import { useCallback, useMemo, useState } from "react";
import {
	createBlankPurchaseOrderAccountingEntry,
	createBlankPurchaseOrderItem,
	createPurchaseOrderId,
	formatPurchaseOrderAmount,
	getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type {
	PurchaseOrderAccountingEntry,
	PurchaseOrderFormValues,
	PurchaseOrderItem,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import {
	PurchaseOrderFieldClassName,
	type PurchaseOrderFieldUpdater,
} from "@/app/src/ui/modules/purchasing/purchase-order/action/PurchaseOrderFieldControls";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createPurchaseOrderLineColumns } from "@/app/src/ui/modules/purchasing/purchase-order/entries/PurchaseOrderLineColumns";
import {
	createPurchasingAccountingEntryColumns,
	PurchasingAccountingDefaultVisibleColumnIds,
	PurchasingAccountingProtectedColumnIds,
	type PurchasingAccountingColumnId,
} from "@/app/src/ui/modules/purchasing/shared/PurchasingAccountingEntryColumns";
import {
	PurchasingEntryTabs,
	type PurchasingEntryTab,
} from "@/app/src/ui/modules/purchasing/shared/PurchasingEntryTabs";

type PurchaseOrderEntrySectionProps = {
	accountingRows: PurchaseOrderAccountingEntry[];
	error?: string;
	isReadonly: boolean;
	rows: PurchaseOrderItem[];
	values: PurchaseOrderFormValues;
	onAccountingRowsChange: (rows: PurchaseOrderAccountingEntry[]) => void;
	onRowsChange: (rows: PurchaseOrderItem[]) => void;
	onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderEntrySection({
	accountingRows,
	error,
	isReadonly,
	onAccountingRowsChange,
	onRowsChange,
	onUpdateField,
	rows,
	values,
}: PurchaseOrderEntrySectionProps) {
	const [activeTab, setActiveTab] = useState<PurchasingEntryTab>("details");
	const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
		PurchasingAccountingColumnId[]
	>([...PurchasingAccountingDefaultVisibleColumnIds]);
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<PurchaseOrderItem>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId ? normalizeEntry({ ...row, ...updates }) : row,
				),
			);
		},
		[onRowsChange, rows],
	);
	const updateAccountingEntry = useCallback(
		(rowId: string, updates: Partial<Omit<PurchaseOrderAccountingEntry, "id">>) => {
			onAccountingRowsChange(
				accountingRows.map((row) =>
					row.id === rowId ? { ...row, ...updates } : row,
				),
			);
		},
		[accountingRows, onAccountingRowsChange],
	);
	const totals = useMemo(
		() => getPurchaseOrderTotals({ ...values, items: rows }),
		[rows, values],
	);
	const columns = useMemo<ModuleDataEntryColumn<PurchaseOrderItem>[]>(
		() => createPurchaseOrderLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const accountingColumns = useMemo(
		() => createPurchasingAccountingEntryColumns(isReadonly, updateAccountingEntry),
		[isReadonly, updateAccountingEntry],
	);
	const visibleAccountingColumns = useMemo(
		() =>
			accountingColumns.filter((column) =>
				visibleAccountingColumnIds.includes(
					column.id as PurchasingAccountingColumnId,
				),
			),
		[accountingColumns, visibleAccountingColumnIds],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "itemName", "quantity", "uom"].includes(column.id),
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
				emptyRowLabel="accounting entry"
				error={error}
				exportOptions={EntryExportOptions}
				isDraggable
				isReadonly={isReadonly}
				rows={accountingRows}
				summaryCells={createAccountingSummaryCells(accountingRows)}
				title={
					<PurchasingEntryTabs
						activeTab={activeTab}
						detailsLabel="Purchase Order Details"
						onTabChange={setActiveTab}
					/>
				}
				onAddRows={(count) =>
					onAccountingRowsChange([
						...accountingRows,
						...Array.from({ length: count }, () =>
							createBlankPurchaseOrderAccountingEntry(),
						),
					])
				}
				onAutoColumnWidth={() => undefined}
				onClearRows={(action) =>
					onAccountingRowsChange(
						clearAccountingRows(
							accountingRows,
							action,
							createBlankPurchaseOrderAccountingEntry,
						),
					)
				}
				onDuplicateRow={(rowId) =>
					onAccountingRowsChange(
						duplicateEntryRow(accountingRows, rowId, () =>
							createBlankPurchaseOrderAccountingEntry().id,
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
							createBlankPurchaseOrderAccountingEntry,
						),
					)
				}
				onMoveRow={(fromRowId, toRowId) =>
					onAccountingRowsChange(moveEntryRow(accountingRows, fromRowId, toRowId))
				}
				onRemoveRow={(rowId) =>
					onAccountingRowsChange(
						removeEntryRow(
							accountingRows,
							rowId,
							createBlankPurchaseOrderAccountingEntry,
						),
					)
				}
				onToggleColumnVisibility={(columnId, isVisible) =>
					setVisibleAccountingColumnIds((current) =>
						toggleAccountingColumnVisibility(
							current,
							columnId as PurchasingAccountingColumnId,
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
			...Array.from({ length: count }, () => createBlankPurchaseOrderItem()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankPurchaseOrderItem()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankPurchaseOrderItem()],
		);
	}

	function duplicateRow(rowId: string) {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		const row = rows[rowIndex];

		if (!row) return;

		const nextRows = [...rows];
		nextRows.splice(rowIndex + 1, 0, {
			...row,
			id: createPurchaseOrderId("item"),
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
			createBlankPurchaseOrderItem(),
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
			nextRows.length > 0 ? nextRows : [createBlankPurchaseOrderItem()],
		);
	}

	return (
		<section className="grid gap-3">
			<ModuleDataEntry
				columns={columns}
				columnOptions={columnOptions}
				description=""
				emptyRowLabel="purchase order line"
				error={error}
				exportOptions={[
					...EntryExportOptions,
				]}
				isDraggable
				isReadonly={isReadonly}
				rows={rows}
				summaryCells={{
					grossAmount: formatPurchaseOrderAmount(totals.grossAmount),
					netAmount: formatPurchaseOrderAmount(totals.netAmount),
					vatAmount: formatPurchaseOrderAmount(totals.vatAmount),
				}}
				title={
					<PurchasingEntryTabs
						activeTab={activeTab}
						detailsLabel="Purchase Order Details"
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
			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
				<div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<CompactAmountField
						id="purchase-order-gross-amount"
						label="Gross Amount"
						readOnly
						value={formatPurchaseOrderAmount(totals.grossAmount)}
					/>
					<CompactAmountField
						id="purchase-order-discount-amount"
						label="Discount Amount"
						readOnly={isReadonly}
						value={values.discountAmount}
						onChange={(value) => onUpdateField("discountAmount", value)}
					/>
					<CompactAmountField
						id="purchase-order-vat-amount"
						label="VAT Amount"
						readOnly={isReadonly}
						value={values.vatAmount}
						onChange={(value) => onUpdateField("vatAmount", value)}
					/>
					<CompactAmountField
						id="purchase-order-net-amount"
						label="Net Amount"
						readOnly
						value={formatPurchaseOrderAmount(totals.netAmount)}
					/>
				</div>
			</div>
		</section>
	);
}

function createAccountingColumnOptions(
	columns: ModuleDataEntryColumn<PurchaseOrderAccountingEntry>[],
	visibleColumnIds: PurchasingAccountingColumnId[],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: !PurchasingAccountingProtectedColumnIds.has(
			column.id as PurchasingAccountingColumnId,
		),
		isVisible: visibleColumnIds.includes(column.id as PurchasingAccountingColumnId),
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}

function toggleAccountingColumnVisibility(
	current: PurchasingAccountingColumnId[],
	columnId: PurchasingAccountingColumnId,
	isVisible: boolean,
) {
	if (PurchasingAccountingProtectedColumnIds.has(columnId)) return current;
	if (isVisible) return current.includes(columnId) ? current : [...current, columnId];
	return current.filter((currentColumnId) => currentColumnId !== columnId);
}

function createAccountingSummaryCells(rows: PurchaseOrderAccountingEntry[]) {
	const totals = rows.reduce(
		(summary, entry) => ({
			credit: summary.credit + entry.credit,
			debit: summary.debit + entry.debit,
		}),
		{ credit: 0, debit: 0 },
	);

	return {
		accountTitle: "Totals",
		credit: formatPurchaseOrderAmount(totals.credit),
		debit: formatPurchaseOrderAmount(totals.debit),
	};
}

function clearAccountingRows(
	rows: PurchaseOrderAccountingEntry[],
	action: ModuleDataEntryClearAction,
	createFallbackRow: () => PurchaseOrderAccountingEntry,
) {
	if (action === "all") return [createFallbackRow()];
	const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));
	return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

function shouldClearAccountingEntry(
	entry: PurchaseOrderAccountingEntry,
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

function insertEntryRow<TRow extends { id: string }>(
	rows: TRow[],
	rowId: string,
	position: "above" | "below",
	createRow: () => TRow,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
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

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];

function CompactAmountField({
	id,
	label,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	label: string;
	onChange?: (value: number) => void;
	readOnly: boolean;
	value: number | string;
}) {
	return (
		<div className="grid min-w-0 gap-2">
			<label htmlFor={id} className="text-sm font-semibold text-darknavy">
				{label}
			</label>
			<input
				id={id}
				type="number"
				value={value}
				readOnly={readOnly || !onChange}
				onChange={(event) => onChange?.(Number(event.target.value))}
				className={`${PurchaseOrderFieldClassName} text-right tabular-nums`}
			/>
		</div>
	);
}

function normalizeEntry(entry: PurchaseOrderItem): PurchaseOrderItem {
	return {
		...entry,
		cost: Number(entry.cost) || 0,
		discountAmount: Number(entry.discountAmount) || 0,
		freightCost: Number(entry.freightCost) || 0,
		prQuantity: Number(entry.prQuantity) || 0,
		quantity: Number(entry.quantity) || 0,
		rateDelivery: Number(entry.rateDelivery) || 0,
		vatAmount: Number(entry.vatAmount) || 0,
	};
}

function shouldClearEntry(
	entry: PurchaseOrderItem,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData = purchaseOrderEntryHasData(entry);

	if (action === "with-data") return hasData;
	if (action === "incomplete") return hasData && !purchaseOrderEntryIsComplete(entry);

	return !hasData;
}

function purchaseOrderEntryHasData(entry: PurchaseOrderItem) {
	return Boolean(
		entry.itemCode.trim() ||
			entry.barcode.trim() ||
			entry.itemName.trim() ||
			entry.itemCategory.trim() ||
			entry.color.trim() ||
			entry.brand.trim() ||
			entry.size.trim() ||
			entry.model.trim() ||
			entry.responsibilityCenter.trim() ||
			entry.budgetCode.trim() ||
			entry.linePrNo.trim() ||
			entry.canvassNo.trim() ||
			Number(entry.quantity) ||
			Number(entry.prQuantity) ||
			Number(entry.rateDelivery) ||
			Number(entry.cost),
	);
}

function purchaseOrderEntryIsComplete(entry: PurchaseOrderItem) {
	return Boolean(
		entry.itemCode.trim() &&
			entry.itemName.trim() &&
			entry.uom.trim() &&
			Number(entry.quantity) >= 0 &&
			Number(entry.cost) >= 0,
	);
}
