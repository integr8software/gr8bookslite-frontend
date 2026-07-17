import { useCallback, useMemo } from "react";
import {
	calculateDeliveryReceiptTotalQuantity,
	createBlankDeliveryReceiptLineEntry,
	deliveryReceiptEntryHasData,
	deliveryReceiptEntryIsComplete,
	formatDeliveryReceiptQuantity,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptLineEntry } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createDeliveryReceiptEntryColumns } from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptEntryColumns";

type DeliveryReceiptEntriesProps = {
	isReadonly: boolean;
	rows: DeliveryReceiptLineEntry[];
	onRowsChange: (rows: DeliveryReceiptLineEntry[]) => void;
};

export function DeliveryReceiptEntries({
	isReadonly,
	onRowsChange,
	rows,
}: DeliveryReceiptEntriesProps) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<DeliveryReceiptLineEntry>) => {
			onRowsChange(
				rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
			);
		},
		[onRowsChange, rows],
	);
	const totalQuantity = useMemo(
		() => calculateDeliveryReceiptTotalQuantity(rows),
		[rows],
	);
	const columns = useMemo<ModuleDataEntryColumn<DeliveryReceiptLineEntry>[]>(
		() => createDeliveryReceiptEntryColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
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

	function addRows(count: number) {
		onRowsChange([
			...rows,
			...Array.from({ length: count }, () =>
				createBlankDeliveryReceiptLineEntry(),
			),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createBlankDeliveryReceiptLineEntry()]);
			return;
		}

		const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
		onRowsChange(
			nextRows.length > 0 ? nextRows : [createBlankDeliveryReceiptLineEntry()],
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
			id: createBlankDeliveryReceiptLineEntry().id,
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
			createBlankDeliveryReceiptLineEntry(),
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
			nextRows.length > 0 ? nextRows : [createBlankDeliveryReceiptLineEntry()],
		);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="delivery line"
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
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
			title="Delivery Receipt Details"
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

function shouldClearEntry(
	entry: DeliveryReceiptLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return deliveryReceiptEntryHasData(entry);
	}

	if (action === "incomplete") {
		return (
			deliveryReceiptEntryHasData(entry) &&
			!deliveryReceiptEntryIsComplete(entry)
		);
	}

	return !deliveryReceiptEntryHasData(entry);
}
