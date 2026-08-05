import { useCallback, useMemo, useState } from "react";
import {
	createBlankCanvassFormAccountingEntry,
	formatCanvassFormAmount,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormAccountingEntry } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import type {
	PurchasingAccountingColumnId,
	PurchasingEntryTab,
} from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	createPurchasingAccountingEntryColumns,
	PurchasingAccountingDefaultVisibleColumnIds,
	PurchasingAccountingProtectedColumnIds,
} from "@/app/src/ui/modules/purchasing/shared/PurchasingAccountingEntryColumns";
import { PurchasingEntryTabs } from "@/app/src/ui/modules/purchasing/shared/PurchasingEntryTabs";

type CanvassFormAccountingEntrySectionProps = {
	error?: string;
	isReadonly: boolean;
	rows: CanvassFormAccountingEntry[];
	onRowsChange: (rows: CanvassFormAccountingEntry[]) => void;
	onTabChange: (tab: PurchasingEntryTab) => void;
};

export function CanvassFormAccountingEntrySection({
	error,
	isReadonly,
	onRowsChange,
	onTabChange,
	rows,
}: CanvassFormAccountingEntrySectionProps) {
	const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
		PurchasingAccountingColumnId[]
	>([...PurchasingAccountingDefaultVisibleColumnIds]);
	const updateAccountingEntry = useCallback(
		(rowId: string, updates: Partial<Omit<CanvassFormAccountingEntry, "id">>) => {
			onRowsChange(
				rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
			);
		},
		[onRowsChange, rows],
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
			rows={rows}
			summaryCells={createAccountingSummaryCells(rows)}
			title={
				<PurchasingEntryTabs
					activeTab="accounting"
					detailsLabel="Canvass Details"
					onTabChange={onTabChange}
				/>
			}
			onAddRows={(count) =>
				onRowsChange([
					...rows,
					...Array.from({ length: count }, () =>
						createBlankCanvassFormAccountingEntry(),
					),
				])
			}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) =>
				onRowsChange(
					clearAccountingRows(
						rows,
						action,
						createBlankCanvassFormAccountingEntry,
					),
				)
			}
			onDuplicateRow={(rowId) =>
				onRowsChange(
					duplicateEntryRow(rows, rowId, () =>
						createBlankCanvassFormAccountingEntry().id,
					),
				)
			}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				onRowsChange(
					insertEntryRow(
						rows,
						rowId,
						position,
						createBlankCanvassFormAccountingEntry,
					),
				)
			}
			onMoveRow={(fromRowId, toRowId) =>
				onRowsChange(moveEntryRow(rows, fromRowId, toRowId))
			}
			onRemoveRow={(rowId) =>
				onRowsChange(
					removeEntryRow(
						rows,
						rowId,
						createBlankCanvassFormAccountingEntry,
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

function createAccountingColumnOptions(
	columns: ModuleDataEntryColumn<CanvassFormAccountingEntry>[],
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

function createAccountingSummaryCells(rows: CanvassFormAccountingEntry[]) {
	const totals = rows.reduce(
		(summary, entry) => ({
			credit: summary.credit + entry.credit,
			debit: summary.debit + entry.debit,
		}),
		{ credit: 0, debit: 0 },
	);

	return {
		accountTitle: "Totals",
		credit: formatCanvassFormAmount(totals.credit),
		debit: formatCanvassFormAmount(totals.debit),
	};
}

function clearAccountingRows(
	rows: CanvassFormAccountingEntry[],
	action: ModuleDataEntryClearAction,
	createFallbackRow: () => CanvassFormAccountingEntry,
) {
	if (action === "all") return [createFallbackRow()];
	const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));
	return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

function shouldClearAccountingEntry(
	entry: CanvassFormAccountingEntry,
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
