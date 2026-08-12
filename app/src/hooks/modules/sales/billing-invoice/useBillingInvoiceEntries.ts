import { useCallback, useMemo, useState } from "react";
import {
	BillingInvoiceAccountingDefaultVisibleColumnIds,
	BillingInvoiceAccountingProtectedColumnIds,
} from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceEntryConstants";
import {
	calculateBillingInvoiceAccountEntryTotals,
	clearBillingInvoiceAccountRows,
	clearBillingInvoiceLineRows,
	duplicateBillingInvoiceAccountRow,
	duplicateBillingInvoiceLineRow,
	insertBillingInvoiceAccountRow,
	insertBillingInvoiceLineRow,
	moveBillingInvoiceEntryRow,
	recalculateBillingInvoiceLineEntry,
	removeBillingInvoiceAccountRow,
	removeBillingInvoiceLineRow,
	updateBillingInvoiceVisibleColumnIds,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceEntryRowsData";
import {
	createBlankBillingInvoiceAccountEntry,
	createBlankBillingInvoiceLineEntry,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceEntriesTab,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type {
	ModuleDataEntryColumn,
	ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	createBillingInvoiceAccountEntryColumns,
	createBillingInvoiceItemEntryColumns,
} from "@/app/src/ui/modules/sales/billing-invoice/entries/BillingInvoiceEntryColumns";

export function useBillingInvoiceEntryTabs() {
	return useState<BillingInvoiceEntriesTab>("items");
}

export function useBillingInvoiceItemEntries({
	isReadonly,
	rows,
	onRowsChange,
}: {
	isReadonly: boolean;
	rows: BillingInvoiceLineEntry[];
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void;
}) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<BillingInvoiceLineEntry>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId
						? recalculateBillingInvoiceLineEntry({ ...row, ...updates })
						: row,
				),
			);
		},
		[onRowsChange, rows],
	);
	const columns = useMemo<ModuleDataEntryColumn<BillingInvoiceLineEntry>[]>(
		() => createBillingInvoiceItemEntryColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() => createFixedColumnOptions(columns),
		[columns],
	);

	return {
		columnOptions,
		columns,
		handleAddRows: (count: number) =>
			onRowsChange([
				...rows,
				...Array.from({ length: count }, () =>
					createBlankBillingInvoiceLineEntry(),
				),
			]),
		handleClearRows: (action: Parameters<typeof clearBillingInvoiceLineRows>[0]) =>
			onRowsChange(clearBillingInvoiceLineRows(action, rows)),
		handleDuplicateRow: (rowId: string) =>
			onRowsChange(duplicateBillingInvoiceLineRow(rowId, rows)),
		handleInsertRow: (rowId: string, position: "above" | "below") =>
			onRowsChange(insertBillingInvoiceLineRow(rowId, position, rows)),
		handleMoveRow: (fromRowId: string, toRowId: string) =>
			onRowsChange(moveBillingInvoiceEntryRow(fromRowId, toRowId, rows)),
		handleRemoveRow: (rowId: string) =>
			onRowsChange(removeBillingInvoiceLineRow(rowId, rows)),
	};
}

export function useBillingInvoiceAccountEntries({
	isReadonly,
	rows,
	onRowsChange,
}: {
	isReadonly: boolean;
	rows: BillingInvoiceAccountEntry[];
	onRowsChange: (rows: BillingInvoiceAccountEntry[]) => void;
}) {
	const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([
		...BillingInvoiceAccountingDefaultVisibleColumnIds,
	]);
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<BillingInvoiceAccountEntry>) => {
			onRowsChange(
				rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
			);
		},
		[onRowsChange, rows],
	);
	const totals = useMemo(
		() => calculateBillingInvoiceAccountEntryTotals(rows),
		[rows],
	);
	const allColumns = useMemo<ModuleDataEntryColumn<BillingInvoiceAccountEntry>[]>(
		() => createBillingInvoiceAccountEntryColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columns = useMemo(
		() => allColumns.filter((column) => visibleColumnIds.includes(column.id)),
		[allColumns, visibleColumnIds],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			allColumns.map((column) => ({
				id: column.id,
				isHideable: !BillingInvoiceAccountingProtectedColumnIds.has(column.id),
				isVisible: visibleColumnIds.includes(column.id),
				label: column.header,
				width: column.width,
				widthMode: column.widthMode,
			})),
		[allColumns, visibleColumnIds],
	);

	function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
		if (!isVisible && BillingInvoiceAccountingProtectedColumnIds.has(columnId)) {
			return;
		}

		setVisibleColumnIds((currentVisibleIds) =>
			updateBillingInvoiceVisibleColumnIds(
				currentVisibleIds,
				allColumns.map((column) => column.id),
				columnId,
				isVisible,
			),
		);
	}

	return {
		columnOptions,
		columns,
		handleAddRows: (count: number) =>
			onRowsChange([
				...rows,
				...Array.from({ length: count }, () =>
					createBlankBillingInvoiceAccountEntry(),
				),
			]),
		handleClearRows: (
			action: Parameters<typeof clearBillingInvoiceAccountRows>[0],
		) => onRowsChange(clearBillingInvoiceAccountRows(action, rows)),
		handleDuplicateRow: (rowId: string) =>
			onRowsChange(duplicateBillingInvoiceAccountRow(rowId, rows)),
		handleInsertRow: (rowId: string, position: "above" | "below") =>
			onRowsChange(insertBillingInvoiceAccountRow(rowId, position, rows)),
		handleMoveRow: (fromRowId: string, toRowId: string) =>
			onRowsChange(moveBillingInvoiceEntryRow(fromRowId, toRowId, rows)),
		handleRemoveRow: (rowId: string) =>
			onRowsChange(removeBillingInvoiceAccountRow(rowId, rows)),
		handleToggleColumnVisibility,
		totals,
	};
}

function createFixedColumnOptions<TRow>(
	columns: ModuleDataEntryColumn<TRow>[],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: false,
		isVisible: true,
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}
