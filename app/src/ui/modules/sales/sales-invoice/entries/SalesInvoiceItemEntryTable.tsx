import { useCallback, useMemo, type ReactNode } from "react";
import { createBlankSalesInvoiceLineItem } from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceFactories";
import type { SalesInvoiceLineItem } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createSalesInvoiceItemColumns } from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntryColumns";
import {
	calculateSalesInvoiceItemEntrySummary,
	createSalesInvoiceColumnOptions,
	formatSalesInvoiceEntryAmount,
	shouldClearSalesInvoiceLineItem,
} from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntryRowUtils";

type SalesInvoiceItemEntryTableProps = {
	isReadonly: boolean;
	rows: SalesInvoiceLineItem[];
	title: ReactNode;
	onRowsChange: (rows: SalesInvoiceLineItem[]) => void;
};

export function SalesInvoiceItemEntryTable({
	isReadonly,
	onRowsChange,
	rows,
	title,
}: SalesInvoiceItemEntryTableProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<SalesInvoiceLineItem>) => {
			onRowsChange(
				rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
			);
		},
		[onRowsChange, rows],
	);
	const columns = useMemo(
		() => createSalesInvoiceItemColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo(
		() => createSalesInvoiceColumnOptions(columns),
		[columns],
	);
	const summary = useMemo(
		() => calculateSalesInvoiceItemEntrySummary(rows),
		[rows],
	);

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="item"
			exportOptions={EntryExportOptions}
			footerDetails={
				<span className="text-sm font-semibold text-darknavy">
					Net Amount: {formatSalesInvoiceEntryAmount(summary.netAmountTotal)}
				</span>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={summary.summaryCells}
			summaryRowHeader="Total"
			title={title}
			onAddRows={(count) =>
				onRowsChange([
					...rows,
					...Array.from({ length: count }, () =>
						createBlankSalesInvoiceLineItem(),
					),
				])
			}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) => clearRows(action, rows, onRowsChange)}
			onDuplicateRow={(rowId) => duplicateRow(rowId, rows, onRowsChange)}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				insertRow(rowId, position, rows, onRowsChange)
			}
			onMoveRow={(fromRowId, toRowId) =>
				moveRow(fromRowId, toRowId, rows, onRowsChange)
			}
			onRemoveRow={(rowId) => removeRow(rowId, rows, onRowsChange)}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function clearRows(
	action: ModuleDataEntryClearAction,
	rows: SalesInvoiceLineItem[],
	onRowsChange: (rows: SalesInvoiceLineItem[]) => void,
) {
	if (action === "all") {
		onRowsChange([createBlankSalesInvoiceLineItem()]);
		return;
	}

	const nextRows = rows.filter(
		(row) => !shouldClearSalesInvoiceLineItem(row, action),
	);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankSalesInvoiceLineItem()],
	);
}

function duplicateRow(
	rowId: string,
	rows: SalesInvoiceLineItem[],
	onRowsChange: (rows: SalesInvoiceLineItem[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createBlankSalesInvoiceLineItem().id,
	});
	onRowsChange(nextRows);
}

function insertRow(
	rowId: string,
	position: "above" | "below",
	rows: SalesInvoiceLineItem[],
	onRowsChange: (rows: SalesInvoiceLineItem[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createBlankSalesInvoiceLineItem(),
	);
	onRowsChange(nextRows);
}

function moveRow(
	fromRowId: string,
	toRowId: string,
	rows: SalesInvoiceLineItem[],
	onRowsChange: (rows: SalesInvoiceLineItem[]) => void,
) {
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

function removeRow(
	rowId: string,
	rows: SalesInvoiceLineItem[],
	onRowsChange: (rows: SalesInvoiceLineItem[]) => void,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankSalesInvoiceLineItem()],
	);
}

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
