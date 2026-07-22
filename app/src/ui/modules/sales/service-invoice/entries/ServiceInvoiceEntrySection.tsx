import { useCallback, useMemo, useState } from "react";
import {
	calculateServiceInvoiceTotals,
	createBlankServiceInvoiceLineEntry,
	createServiceInvoiceAccountingEntries as createDefaultServiceInvoiceAccountingEntries,
	formatServiceInvoiceAmount,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type {
	ServiceInvoiceAccountingEntry,
	ServiceInvoiceFormValues,
	ServiceInvoiceLineEntry,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createServiceInvoiceAccountingEntryColumns } from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceAccountingEntryColumns";
import { createServiceInvoiceServiceDetailColumns } from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceServiceDetailColumns";
import {
	createBlankServiceInvoiceAccountingEntry,
	createServiceInvoiceAccountingEntries as createBlankServiceInvoiceAccountingEntries,
	createServiceInvoiceLineEntries,
	duplicateEntryRow,
	insertEntryRow,
	moveEntryRow,
	recalculateServiceInvoiceEntry,
	removeEntryRow,
	shouldClearServiceInvoiceAccountingEntry,
	shouldClearServiceInvoiceLineEntry,
} from "@/app/src/ui/modules/sales/service-invoice/entries/utils/ServiceInvoiceEntryRowUtils";
import {
	ServiceInvoiceEntryTabs,
	type ServiceInvoiceEntryTab,
} from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceEntryTabs";

type ServiceInvoiceEntrySectionProps = {
	isReadonly: boolean;
	values: ServiceInvoiceFormValues;
	onAccountingRowsChange: (rows: ServiceInvoiceAccountingEntry[]) => void;
	onRowsChange: (rows: ServiceInvoiceLineEntry[]) => void;
};

export function ServiceInvoiceEntrySection({
	isReadonly,
	onAccountingRowsChange,
	onRowsChange,
	values,
}: ServiceInvoiceEntrySectionProps) {
	const [activeTab, setActiveTab] = useState<ServiceInvoiceEntryTab>("service");
	const serviceRows = values.lineEntries;
	const accountingRows =
		values.accountingEntries?.length > 0
			? values.accountingEntries
			: createDefaultServiceInvoiceAccountingEntries(values);
	const updateServiceEntry = useCallback(
		(rowId: string, updates: Partial<ServiceInvoiceLineEntry>) => {
			onRowsChange(
				serviceRows.map((row) =>
					row.id === rowId
						? recalculateServiceInvoiceEntry({ ...row, ...updates })
						: row,
				),
			);
		},
		[onRowsChange, serviceRows],
	);
	const updateAccountingEntry = useCallback(
		(
			rowId: string,
			updates: Partial<Omit<ServiceInvoiceAccountingEntry, "id">>,
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
			createServiceInvoiceServiceDetailColumns(
				isReadonly,
				updateServiceEntry,
			),
		[isReadonly, updateServiceEntry],
	);
	const accountingColumns = useMemo(
		() =>
			createServiceInvoiceAccountingEntryColumns(
				isReadonly,
				updateAccountingEntry,
			),
		[isReadonly, updateAccountingEntry],
	);

	if (activeTab === "accounting") {
		return (
			<ModuleDataEntry
				columns={accountingColumns}
				columnOptions={createColumnOptions(accountingColumns)}
				description=""
				emptyRowLabel="entry"
				exportOptions={EntryExportOptions}
				isDraggable
				isReadonly={isReadonly}
				rows={accountingRows}
				summaryCells={createAccountingSummaryCells(accountingRows)}
				title={
					<ServiceInvoiceEntryTabs
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>
				}
				onAddRows={(count) =>
					onAccountingRowsChange([
						...accountingRows,
						...createBlankServiceInvoiceAccountingEntries(count),
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
							() => createBlankServiceInvoiceAccountingEntry().id,
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
							createBlankServiceInvoiceAccountingEntry,
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
							createBlankServiceInvoiceAccountingEntry,
						),
					)
				}
				onToggleColumnVisibility={() => undefined}
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
				<ServiceInvoiceEntryTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
			}
			onAddRows={(count) =>
				onRowsChange([...serviceRows, ...createServiceInvoiceLineEntries(count)])
			}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) => clearServiceRows(action, serviceRows, onRowsChange)}
			onDuplicateRow={(rowId) =>
				onRowsChange(
					duplicateEntryRow(
						serviceRows,
						rowId,
						() => createBlankServiceInvoiceLineEntry().id,
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
						createBlankServiceInvoiceLineEntry,
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
						createBlankServiceInvoiceLineEntry,
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

function createServiceSummaryCells(rows: ServiceInvoiceLineEntry[]) {
	const totals = calculateServiceInvoiceTotals(rows);

	return {
		discountAmount: formatServiceInvoiceAmount(totals.discountAmount),
		grossAmount: formatServiceInvoiceAmount(totals.grossAmount),
		netAmount: formatServiceInvoiceAmount(totals.netAmount),
		vatAmount: formatServiceInvoiceAmount(totals.vatAmount),
		wvatAmount: formatServiceInvoiceAmount(totals.wvatAmount),
	};
}

function createAccountingSummaryCells(rows: ServiceInvoiceAccountingEntry[]) {
	const totals = rows.reduce(
		(summary, entry) => ({
			credit: summary.credit + entry.credit,
			debit: summary.debit + entry.debit,
		}),
		{ credit: 0, debit: 0 },
	);

	return {
		accountTitle: "Totals",
		credit: formatServiceInvoiceAmount(totals.credit),
		debit: formatServiceInvoiceAmount(totals.debit),
	};
}

function clearServiceRows(
	action: ModuleDataEntryClearAction,
	rows: ServiceInvoiceLineEntry[],
	onRowsChange: (rows: ServiceInvoiceLineEntry[]) => void,
) {
	if (action === "all") {
		onRowsChange([createBlankServiceInvoiceLineEntry()]);
		return;
	}

	const nextRows = rows.filter(
		(row) => !shouldClearServiceInvoiceLineEntry(row, action),
	);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankServiceInvoiceLineEntry()],
	);
}

function clearAccountingRows(
	action: ModuleDataEntryClearAction,
	rows: ServiceInvoiceAccountingEntry[],
	onRowsChange: (rows: ServiceInvoiceAccountingEntry[]) => void,
) {
	if (action === "all") {
		onRowsChange([createBlankServiceInvoiceAccountingEntry()]);
		return;
	}

	const nextRows = rows.filter(
		(row) => !shouldClearServiceInvoiceAccountingEntry(row, action),
	);
	onRowsChange(
		nextRows.length > 0
			? nextRows
			: [createBlankServiceInvoiceAccountingEntry()],
	);
}

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
