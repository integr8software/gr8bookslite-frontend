import { useCallback, useMemo } from "react";
import {
	createSalesQuotationId,
	emptySalesQuotationItem,
	formatSalesQuotationCurrency,
	getSalesQuotationTotals,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type { SalesQuotationItem } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createSalesQuotationEntryColumns } from "@/app/src/ui/modules/sales/sales-quotation/entries/SalesQuotationEntryColumns";

type SalesQuotationEntriesProps = {
	error?: string;
	isReadonly: boolean;
	rows: SalesQuotationItem[];
	onRowsChange: (rows: SalesQuotationItem[]) => void;
};

export function SalesQuotationEntries({
	error,
	isReadonly,
	onRowsChange,
	rows,
}: SalesQuotationEntriesProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<SalesQuotationItem>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId ? normalizeEntry({ ...row, ...updates }) : row,
				),
			);
		},
		[onRowsChange, rows],
	);
	const totals = useMemo(() => getSalesQuotationTotals({ items: rows }), [rows]);
	const columns = useMemo<ModuleDataEntryColumn<SalesQuotationItem>[]>(
		() => createSalesQuotationEntryColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "itemName", "quantity"].includes(
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
			...Array.from({ length: count }, () => createBlankSalesQuotationItem()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankSalesQuotationItem()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankSalesQuotationItem()],
		);
	}

	function duplicateRow(rowId: string) {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		const row = rows[rowIndex];

		if (!row) return;

		const nextRows = [...rows];
		nextRows.splice(rowIndex + 1, 0, {
			...row,
			id: createSalesQuotationId("item"),
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
			createBlankSalesQuotationItem(),
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
			nextRows.length > 0 ? nextRows : [createBlankSalesQuotationItem()],
		);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="sales quotation line"
			error={error}
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Gross: {formatSalesQuotationCurrency(totals.grossAmount)}</span>
					<span>VAT: {formatSalesQuotationCurrency(totals.vatAmount)}</span>
					<span>EWT: {formatSalesQuotationCurrency(totals.ewtAmount)}</span>
					<span>Discount: {formatSalesQuotationCurrency(totals.discountAmount)}</span>
					<span>Net: {formatSalesQuotationCurrency(totals.netAmount)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				grossAmount: formatSalesQuotationCurrency(totals.grossAmount),
				vatAmount: formatSalesQuotationCurrency(totals.vatAmount),
				ewtAmount: formatSalesQuotationCurrency(totals.ewtAmount),
				discountAmount: formatSalesQuotationCurrency(totals.discountAmount),
				netAmount: formatSalesQuotationCurrency(totals.netAmount),
			}}
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

function createBlankSalesQuotationItem(): SalesQuotationItem {
	return {
		...emptySalesQuotationItem,
		id: createSalesQuotationId("item"),
	};
}

function normalizeEntry(entry: SalesQuotationItem): SalesQuotationItem {
	return {
		...entry,
		itemPrice: Number(entry.itemPrice) || 0,
		ewtAmount: Number(entry.ewtAmount) || 0,
		discountAmount: Number(entry.discountAmount) || 0,
		quantity: Number(entry.quantity) || 0,
	};
}

function shouldClearEntry(
	entry: SalesQuotationItem,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData = salesQuotationEntryHasData(entry);

	if (action === "with-data") {
		return hasData;
	}

	if (action === "incomplete") {
		return hasData && !salesQuotationEntryIsComplete(entry);
	}

	return !hasData;
}

function salesQuotationEntryHasData(entry: SalesQuotationItem) {
	return Boolean(
		entry.itemCode.trim() ||
			entry.barcode.trim() ||
			entry.itemName.trim() ||
			entry.itemCategory.trim() ||
			entry.responsibilityCenter.trim() ||
			Number(entry.quantity) ||
			Number(entry.itemPrice),
	);
}

function salesQuotationEntryIsComplete(entry: SalesQuotationItem) {
	return Boolean(
		entry.itemCode.trim() &&
			entry.itemName.trim() &&
			entry.uom.trim() &&
			Number(entry.quantity) > 0 &&
			Number(entry.itemPrice) >= 0,
	);
}
