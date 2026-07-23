import { useCallback, useMemo } from "react";
import {
	calculateDeliveryReceiptTotalQuantity,
	formatDeliveryReceiptQuantity,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptLineEntry } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createDeliveryReceiptLineColumns } from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptLineColumns";
import {
	clearDeliveryReceiptLines,
	createDeliveryReceiptLineEntries,
	duplicateDeliveryReceiptLine,
	insertDeliveryReceiptLine,
	moveDeliveryReceiptLine,
	removeDeliveryReceiptLine,
} from "@/app/src/ui/modules/inventory/delivery-receipt/entries/utils/DeliveryReceiptEntryRowUtils";

type DeliveryReceiptEntrySectionProps = {
	isReadonly: boolean;
	rows: DeliveryReceiptLineEntry[];
	onRowsChange: (rows: DeliveryReceiptLineEntry[]) => void;
};

export function DeliveryReceiptEntrySection({
	isReadonly,
	onRowsChange,
	rows,
}: DeliveryReceiptEntrySectionProps) {
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
		() => createDeliveryReceiptLineColumns(isReadonly, updateEntry),
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
