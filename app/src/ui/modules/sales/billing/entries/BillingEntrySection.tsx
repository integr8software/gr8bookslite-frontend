import { useCallback, useMemo, useState } from "react";
import {
	calculateBillingTotals,
	createBlankBillingLineEntry,
	createBillingAccountingEntries as createDefaultBillingAccountingEntries,
	formatBillingAmount,
} from "@/app/src/data/modules/sales/billing/BillingData";
import type {
	BillingAccountingColumnId,
	BillingAccountingEntry,
	BillingEntryTab,
	BillingFormValues,
	BillingLineEntry,
} from "@/app/src/types/modules/sales/billing/BillingTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createBillingAccountingEntryColumns } from "@/app/src/ui/modules/sales/billing/entries/BillingAccountingEntryColumns";
import {
	BillingAccountingDefaultVisibleColumnIds,
	BillingAccountingProtectedColumnIds,
} from "@/app/src/ui/modules/sales/billing/entries/BillingAccountingEntryColumns";
import { createBillingServiceDetailColumns } from "@/app/src/ui/modules/sales/billing/entries/BillingServiceDetailColumns";
import {
	createBlankBillingAccountingEntry,
	createBillingAccountingEntries as createBlankBillingAccountingEntries,
	createBillingLineEntries,
	duplicateEntryRow,
	insertEntryRow,
	moveEntryRow,
	recalculateBillingEntry,
	removeEntryRow,
	shouldClearBillingAccountingEntry,
	shouldClearBillingLineEntry,
} from "@/app/src/ui/modules/sales/billing/entries/utils/BillingEntryRowUtils";
import { BillingEntryTabs } from "@/app/src/ui/modules/sales/billing/entries/BillingEntryTabs";

type BillingEntrySectionProps = {
	isReadonly: boolean;
	values: BillingFormValues;
	onAccountingRowsChange: (rows: BillingAccountingEntry[]) => void;
	onRowsChange: (rows: BillingLineEntry[]) => void;
};

export function BillingEntrySection({
	isReadonly,
	onAccountingRowsChange,
	onRowsChange,
	values,
}: BillingEntrySectionProps) {
	const [activeTab, setActiveTab] = useState<BillingEntryTab>("service");
	const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
		BillingAccountingColumnId[]
	>([...BillingAccountingDefaultVisibleColumnIds]);
	const serviceRows = values.lineEntries;
	const accountingRows =
		values.accountingEntries?.length > 0
			? values.accountingEntries
			: createDefaultBillingAccountingEntries(values);
	const updateServiceEntry = useCallback(
		(rowId: string, updates: Partial<BillingLineEntry>) => {
			onRowsChange(
				serviceRows.map((row) =>
					row.id === rowId
						? recalculateBillingEntry({ ...row, ...updates })
						: row,
				),
			);
		},
		[onRowsChange, serviceRows],
	);
	const updateAccountingEntry = useCallback(
		(
			rowId: string,
			updates: Partial<Omit<BillingAccountingEntry, "id">>,
		) => {
			onAccountingRowsChange(
				accountingRows.map((row) =>
					row.id === rowId ? { ...row, ...updates } : row,
				),
			);
		},
		[accountingRows, onAccountingRowsChange],
	);
	const serviceColumns = useMemo(
		() =>
			createBillingServiceDetailColumns(
				isReadonly,
				updateServiceEntry,
			),
		[isReadonly, updateServiceEntry],
	);
	const accountingColumns = useMemo(
		() =>
			createBillingAccountingEntryColumns(
				isReadonly,
				updateAccountingEntry,
			),
		[isReadonly, updateAccountingEntry],
	);
	const visibleAccountingColumns = useMemo(
		() =>
			accountingColumns.filter((column) =>
				visibleAccountingColumnIds.includes(
					column.id as BillingAccountingColumnId,
				),
			),
		[accountingColumns, visibleAccountingColumnIds],
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
				emptyRowLabel="entry"
				exportOptions={EntryExportOptions}
				isDraggable
				isReadonly={isReadonly}
				rows={accountingRows}
				summaryCells={createAccountingSummaryCells(accountingRows)}
				title={
					<BillingEntryTabs
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>
				}
				onAddRows={(count) =>
					onAccountingRowsChange([
						...accountingRows,
						...createBlankBillingAccountingEntries(count),
					])
				}
				onAutoColumnWidth={() => undefined}
				onClearRows={(action) =>
					clearAccountingRows(action, accountingRows, onAccountingRowsChange)
				}
				onDuplicateRow={(rowId) =>
					onAccountingRowsChange(
						duplicateEntryRow(
							accountingRows,
							rowId,
							() => createBlankBillingAccountingEntry().id,
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
							createBlankBillingAccountingEntry,
						),
					)
				}
				onMoveRow={(fromRowId, toRowId) =>
					onAccountingRowsChange(
						moveEntryRow(accountingRows, fromRowId, toRowId),
					)
				}
				onRemoveRow={(rowId) =>
					onAccountingRowsChange(
						removeEntryRow(
							accountingRows,
							rowId,
							createBlankBillingAccountingEntry,
						),
					)
				}
				onToggleColumnVisibility={(columnId, isVisible) =>
					setVisibleAccountingColumnIds((current) =>
						toggleAccountingColumnVisibility(
							current,
							columnId as BillingAccountingColumnId,
							isVisible,
						),
					)
				}
				onUpdateColumnHeader={() => undefined}
				onUpdateColumnWidth={() => undefined}
			/>
		);
	}

	return (
		<ModuleDataEntry
			columns={serviceColumns}
			columnOptions={createColumnOptions(serviceColumns, [
				"description",
				"grossAmount",
			])}
			description=""
			emptyRowLabel="entry"
			exportOptions={EntryExportOptions}
			isDraggable
			isReadonly={isReadonly}
			rows={serviceRows}
			summaryCells={createServiceSummaryCells(serviceRows)}
			title={
				<BillingEntryTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
			}
			onAddRows={(count) =>
				onRowsChange([...serviceRows, ...createBillingLineEntries(count)])
			}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) => clearServiceRows(action, serviceRows, onRowsChange)}
			onDuplicateRow={(rowId) =>
				onRowsChange(
					duplicateEntryRow(
						serviceRows,
						rowId,
						() => createBlankBillingLineEntry().id,
					),
				)
			}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				onRowsChange(
					insertEntryRow(
						serviceRows,
						rowId,
						position,
						createBlankBillingLineEntry,
					),
				)
			}
			onMoveRow={(fromRowId, toRowId) =>
				onRowsChange(moveEntryRow(serviceRows, fromRowId, toRowId))
			}
			onRemoveRow={(rowId) =>
				onRowsChange(
					removeEntryRow(
						serviceRows,
						rowId,
						createBlankBillingLineEntry,
					),
				)
			}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function createColumnOptions<TRow>(
	columns: ModuleDataEntryColumn<TRow>[],
	protectedColumnIds: string[] = [],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: !protectedColumnIds.includes(column.id),
		isVisible: true,
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}

function createAccountingColumnOptions(
	columns: ModuleDataEntryColumn<BillingAccountingEntry>[],
	visibleColumnIds: BillingAccountingColumnId[],
): ModuleDataEntryColumnOption[] {
	return columns.map((column) => ({
		id: column.id,
		isHideable: !BillingAccountingProtectedColumnIds.has(
			column.id as BillingAccountingColumnId,
		),
		isVisible: visibleColumnIds.includes(
			column.id as BillingAccountingColumnId,
		),
		label: column.header,
		width: column.width,
		widthMode: column.widthMode,
	}));
}

function toggleAccountingColumnVisibility(
	current: BillingAccountingColumnId[],
	columnId: BillingAccountingColumnId,
	isVisible: boolean,
) {
	if (BillingAccountingProtectedColumnIds.has(columnId)) {
		return current;
	}

	if (isVisible) {
		return current.includes(columnId) ? current : [...current, columnId];
	}

	return current.filter((currentColumnId) => currentColumnId !== columnId);
}

function createServiceSummaryCells(rows: BillingLineEntry[]) {
	const totals = calculateBillingTotals(rows);

	return {
		discountAmount: formatBillingAmount(totals.discountAmount),
		grossAmount: formatBillingAmount(totals.grossAmount),
		netAmount: formatBillingAmount(totals.netAmount),
		vatAmount: formatBillingAmount(totals.vatAmount),
		wvatAmount: formatBillingAmount(totals.wvatAmount),
	};
}

function createAccountingSummaryCells(rows: BillingAccountingEntry[]) {
	const totals = rows.reduce(
		(summary, entry) => ({
			credit: summary.credit + entry.credit,
			debit: summary.debit + entry.debit,
		}),
		{ credit: 0, debit: 0 },
	);

	return {
		accountTitle: "Totals",
		credit: formatBillingAmount(totals.credit),
		debit: formatBillingAmount(totals.debit),
	};
}

function clearServiceRows(
	action: ModuleDataEntryClearAction,
	rows: BillingLineEntry[],
	onRowsChange: (rows: BillingLineEntry[]) => void,
) {
	if (action === "all") {
		onRowsChange([createBlankBillingLineEntry()]);
		return;
	}

	const nextRows = rows.filter(
		(row) => !shouldClearBillingLineEntry(row, action),
	);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankBillingLineEntry()],
	);
}

function clearAccountingRows(
	action: ModuleDataEntryClearAction,
	rows: BillingAccountingEntry[],
	onRowsChange: (rows: BillingAccountingEntry[]) => void,
) {
	if (action === "all") {
		onRowsChange([createBlankBillingAccountingEntry()]);
		return;
	}

	const nextRows = rows.filter(
		(row) => !shouldClearBillingAccountingEntry(row, action),
	);
	onRowsChange(
		nextRows.length > 0
			? nextRows
			: [createBlankBillingAccountingEntry()],
	);
}

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
