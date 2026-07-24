import { useCallback, useMemo } from "react";
import {
	createBlankPurchaseOrderItem,
	createPurchaseOrderId,
	formatPurchaseOrderAmount,
	getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { PurchaseOrderItem } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createPurchaseOrderLineColumns } from "@/app/src/ui/modules/purchasing/purchase-order/entries/PurchaseOrderLineColumns";

type PurchaseOrderEntrySectionProps = {
	error?: string;
	isReadonly: boolean;
	rows: PurchaseOrderItem[];
	onRowsChange: (rows: PurchaseOrderItem[]) => void;
};

export function PurchaseOrderEntrySection({
	error,
	isReadonly,
	onRowsChange,
	rows,
}: PurchaseOrderEntrySectionProps) {
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
	const totals = useMemo(
		() => getPurchaseOrderTotals({ discountAmount: 0, items: rows, vatAmount: 0 }),
		[rows],
	);
	const columns = useMemo<ModuleDataEntryColumn<PurchaseOrderItem>[]>(
		() => createPurchaseOrderLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "itemName", "quantity"].includes(column.id),
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
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="purchase order line"
			error={error}
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Gross: {formatPurchaseOrderAmount(totals.grossAmount)}</span>
					<span>VAT: {formatPurchaseOrderAmount(totals.vatAmount)}</span>
					<span>Net: {formatPurchaseOrderAmount(totals.netAmount)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				grossAmount: formatPurchaseOrderAmount(totals.grossAmount),
				netAmount: formatPurchaseOrderAmount(totals.netAmount),
				vatAmount: formatPurchaseOrderAmount(totals.vatAmount),
			}}
			title="Entries"
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
			entry.responsibilityCenter.trim() ||
			entry.budgetCode.trim() ||
			Number(entry.quantity) ||
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
