import { useCallback, useMemo } from "react";
import {
	createBlankPurchaseOrderItem,
	createPurchaseOrderId,
	formatPurchaseOrderAmount,
	getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type {
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
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createPurchaseOrderLineColumns } from "@/app/src/ui/modules/purchasing/purchase-order/entries/PurchaseOrderLineColumns";

type PurchaseOrderEntrySectionProps = {
	error?: string;
	isReadonly: boolean;
	rows: PurchaseOrderItem[];
	values: PurchaseOrderFormValues;
	onRowsChange: (rows: PurchaseOrderItem[]) => void;
	onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderEntrySection({
	error,
	isReadonly,
	onRowsChange,
	onUpdateField,
	rows,
	values,
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
		() => getPurchaseOrderTotals({ ...values, items: rows }),
		[rows, values],
	);
	const columns = useMemo<ModuleDataEntryColumn<PurchaseOrderItem>[]>(
		() => createPurchaseOrderLineColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
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
					{ id: "csv", label: "CSV", onSelect: () => undefined },
					{ id: "excel", label: "Excel", onSelect: () => undefined },
					{ id: "pdf", label: "PDF", onSelect: () => undefined },
				]}
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
