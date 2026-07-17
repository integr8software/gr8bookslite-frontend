import { useCallback, useMemo } from "react";
import {
	calculateServiceInvoiceTotals,
	createBlankServiceInvoiceLineEntry,
	formatServiceInvoiceAmount,
	serviceInvoiceEntryHasData,
	serviceInvoiceEntryIsComplete,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceLineEntry } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { createServiceInvoiceEntryColumns } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceEntryColumns";

type ServiceInvoiceEntriesProps = {
	isReadonly: boolean;
	rows: ServiceInvoiceLineEntry[];
	onRowsChange: (rows: ServiceInvoiceLineEntry[]) => void;
};

export function ServiceInvoiceEntries({
	isReadonly,
	onRowsChange,
	rows,
}: ServiceInvoiceEntriesProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<ServiceInvoiceLineEntry>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId ? recalculateEntry({ ...row, ...updates }) : row,
				),
			);
		},
		[onRowsChange, rows],
	);
	const totals = useMemo(() => calculateServiceInvoiceTotals(rows), [rows]);
	const columns = useMemo<ModuleDataEntryColumn<ServiceInvoiceLineEntry>[]>(
		() => createServiceInvoiceEntryColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["description", "particulars", "grossAmount"].includes(
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
			...Array.from({ length: count }, () =>
				createBlankServiceInvoiceLineEntry(),
			),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankServiceInvoiceLineEntry()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankServiceInvoiceLineEntry()],
		);
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
			id: createBlankServiceInvoiceLineEntry().id,
		});
		onRowsChange(nextRows);
	}

	function insertRow(rowId: string, position: "above" | "below") {
		const rowIndex = rows.findIndex((row) => row.id === rowId);

		if (rowIndex < 0) {
			return;
		}

		const nextRows = [...rows];
		nextRows.splice(
			position === "above" ? rowIndex : rowIndex + 1,
			0,
			createBlankServiceInvoiceLineEntry(),
		);
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
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankServiceInvoiceLineEntry()],
		);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="service line"
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Net: {formatServiceInvoiceAmount(totals.netAmount)}</span>
					<span>VAT: {formatServiceInvoiceAmount(totals.vatAmount)}</span>
					<span>Gross: {formatServiceInvoiceAmount(totals.grossAmount)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				discountAmount: formatServiceInvoiceAmount(totals.discountAmount),
				ewtAmount: formatServiceInvoiceAmount(totals.ewtAmount),
				grossAmount: formatServiceInvoiceAmount(totals.grossAmount),
				netAmount: formatServiceInvoiceAmount(totals.netAmount),
				vatAmount: formatServiceInvoiceAmount(totals.vatAmount),
				wvatAmount: formatServiceInvoiceAmount(totals.wvatAmount),
			}}
			title="Service Invoice Details"
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

function recalculateEntry(
	entry: ServiceInvoiceLineEntry,
): ServiceInvoiceLineEntry {
	const amount = parseMoneyNumberInput(entry.amount);
	const quantity = parseMoneyNumberInput(entry.quantity);
	const discountAmount = parseMoneyNumberInput(entry.discountAmount);
	const netAmount = parseMoneyNumberInput(entry.netAmount);
	const vatAmount = parseMoneyNumberInput(entry.vatAmount);
	const computedNetAmount = amount > 0 ? amount * Math.max(quantity, 1) : netAmount;
	const computedGrossAmount =
		computedNetAmount + vatAmount - discountAmount;

	return {
		...entry,
		netAmount:
			amount > 0 ? computedNetAmount.toFixed(2) : entry.netAmount,
		grossAmount:
			computedGrossAmount > 0
				? computedGrossAmount.toFixed(2)
				: entry.grossAmount,
	};
}

function shouldClearEntry(
	entry: ServiceInvoiceLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return serviceInvoiceEntryHasData(entry);
	}

	if (action === "incomplete") {
		return serviceInvoiceEntryHasData(entry) && !serviceInvoiceEntryIsComplete(entry);
	}

	return !serviceInvoiceEntryHasData(entry);
}


