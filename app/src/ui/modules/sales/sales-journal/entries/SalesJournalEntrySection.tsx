import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
	createSalesJournalItemEntry,
	createSalesJournalLine,
	formatSalesJournalAmount,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import {
	calculateSalesJournalItemTotals,
	duplicateSalesJournalRow,
	insertSalesJournalRow,
	moveSalesJournalRow,
	recalculateSalesJournalItemEntry,
	shouldClearSalesJournalAccountEntry,
	shouldClearSalesJournalItemEntry,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalEntryData";
import type { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import type {
	SalesJournalEntryClearAction,
	SalesJournalItemEntry,
	SalesJournalLine,
	SalesJournalLineField,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
	createSalesJournalAccountColumns,
	createSalesJournalColumnOptions,
	createSalesJournalItemColumns,
} from "@/app/src/ui/modules/sales/sales-journal/entries/SalesJournalEntryColumns";

type SalesJournalEntrySectionProps = {
	page: ReturnType<typeof useSalesJournalFormPage>;
};

type SalesJournalEntryTab = "accounts" | "items";

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
];

const SalesJournalEntryTabsList = [
	{ id: "items", label: "Item Entry" },
	{ id: "accounts", label: "Account Entry" },
] satisfies Array<{
	id: SalesJournalEntryTab;
	label: string;
}>;

export function SalesJournalEntrySection({ page }: SalesJournalEntrySectionProps) {
	return <SalesJournalEntries page={page} />;
}

function SalesJournalEntries({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	const [activeTab, setActiveTab] =
		useState<SalesJournalEntryTab>("items");
	const tabs = (
		<SalesJournalEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />
	);

	if (activeTab === "accounts") {
		return <SalesJournalAccountEntries page={page} title={tabs} />;
	}

	return <SalesJournalItemEntries page={page} title={tabs} />;
}

function SalesJournalEntryTabs({
	activeTab,
	onTabChange,
}: {
	activeTab: SalesJournalEntryTab;
	onTabChange: (tab: SalesJournalEntryTab) => void;
}) {
	return (
		<div
			role="tablist"
			aria-label="Sales journal row entry sections"
			className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
		>
			{SalesJournalEntryTabsList.map((tab) => {
				const isActive = activeTab === tab.id;

				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						className={joinClasses(
							"h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
							isActive
								? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
								: "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
						)}
						onClick={() => onTabChange(tab.id)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

function SalesJournalItemEntries({
	page,
	title,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
	title: ReactNode;
}) {
	const rows = page.values.itemEntries;
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<SalesJournalItemEntry>) => {
			page.updateItemEntries(
				rows.map((row) =>
					row.id === rowId
						? recalculateSalesJournalItemEntry({ ...row, ...updates })
						: row,
				),
			);
		},
		[page, rows],
	);
	const columns = useMemo<ModuleDataEntryColumn<SalesJournalItemEntry>[]>(
		() => createSalesJournalItemColumns(page.isReadonly, updateEntry),
		[page.isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() => createSalesJournalColumnOptions(columns),
		[columns],
	);
	const totals = useMemo(() => calculateSalesJournalItemTotals(rows), [rows]);

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="item"
			exportOptions={EntryExportOptions}
			isDraggable
			isReadonly={page.isReadonly}
			rows={rows}
			summaryCells={{
				amount: formatSalesJournalAmount(totals.amount),
				discountAmount: formatSalesJournalAmount(totals.discountAmount),
				netAmount: formatSalesJournalAmount(totals.netAmount),
				vatAmount: formatSalesJournalAmount(totals.vatAmount),
				vatInclusiveAmount: formatSalesJournalAmount(totals.vatInclusiveAmount),
			}}
			summaryRowHeader="Total"
			title={title}
			onAddRows={(count) =>
				page.updateItemEntries([
					...rows,
					...Array.from({ length: count }, () =>
						createSalesJournalItemEntry(),
					),
				])
			}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) => clearItemRows(action, rows, page.updateItemEntries)}
			onDuplicateRow={(rowId) =>
				page.updateItemEntries(
					duplicateSalesJournalRow(rowId, rows, createSalesJournalItemEntry),
				)
			}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				page.updateItemEntries(
					insertSalesJournalRow(rowId, position, rows, () =>
						createSalesJournalItemEntry(),
					),
				)
			}
			onMoveRow={(fromRowId, toRowId) =>
				page.updateItemEntries(moveSalesJournalRow(fromRowId, toRowId, rows))
			}
			onRemoveRow={(rowId) =>
				removeItemRow(rowId, rows, page.updateItemEntries)
			}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function SalesJournalAccountEntries({
	page,
	title,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
	title: ReactNode;
}) {
	const rows = page.values.lines;
	const updateEntry = useCallback(
		(rowId: string, field: SalesJournalLineField, value: string) => {
			page.updateLine(rowId, field, value);
		},
		[page],
	);
	const columns = useMemo<ModuleDataEntryColumn<SalesJournalLine>[]>(
		() => createSalesJournalAccountColumns(page.isReadonly, updateEntry),
		[page.isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() => createSalesJournalColumnOptions(columns),
		[columns],
	);

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description="Line items must balance before the sales journal can be saved."
			emptyRowLabel="entry"
			error={page.errors.lines ?? page.errors.balance}
			exportOptions={EntryExportOptions}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span
						className={
							page.totals.isBalanced ? "text-emerald-700" : "text-red-600"
						}
					>
						Variance:{" "}
						{formatSalesJournalAmount(Math.abs(page.totals.variance))}
					</span>
				</div>
			}
			isDraggable
			isReadonly={page.isReadonly}
			rows={rows}
			summaryCells={{
				credit: formatSalesJournalAmount(page.totals.totalCredit),
				debit: formatSalesJournalAmount(page.totals.totalDebit),
			}}
			summaryRowHeader="Totals"
			title={title}
			onAddRows={(count) => addAccountRows(count, rows, page.updateLines)}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) => clearAccountRows(action, rows, page.updateLines)}
			onDuplicateRow={(rowId) =>
				page.updateLines(
					duplicateSalesJournalRow(rowId, rows, () =>
						createSalesJournalLine(rows.length + 1),
					),
				)
			}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				page.updateLines(
					insertSalesJournalRow(rowId, position, rows, (rowIndex) =>
						createSalesJournalLine(rowIndex + 1),
					),
				)
			}
			onMoveRow={(fromRowId, toRowId) =>
				page.updateLines(moveSalesJournalRow(fromRowId, toRowId, rows))
			}
			onRemoveRow={(rowId) =>
				removeAccountRow(rowId, rows, page.updateLines)
			}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function clearItemRows(
	action: SalesJournalEntryClearAction,
	rows: SalesJournalItemEntry[],
	onRowsChange: (rows: SalesJournalItemEntry[]) => void,
) {
	if (action === "all") {
		onRowsChange([createSalesJournalItemEntry()]);
		return;
	}

	const nextRows = rows.filter(
		(row) => !shouldClearSalesJournalItemEntry(row, action),
	);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createSalesJournalItemEntry()],
	);
}

function removeItemRow(
	rowId: string,
	rows: SalesJournalItemEntry[],
	onRowsChange: (rows: SalesJournalItemEntry[]) => void,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createSalesJournalItemEntry()],
	);
}

function addAccountRows(
	count: number,
	rows: SalesJournalLine[],
	onRowsChange: (rows: SalesJournalLine[]) => void,
) {
	onRowsChange([
		...rows,
		...Array.from({ length: count }, (_, index) =>
			createSalesJournalLine(rows.length + index + 1),
		),
	]);
}

function clearAccountRows(
	action: SalesJournalEntryClearAction,
	rows: SalesJournalLine[],
	onRowsChange: (rows: SalesJournalLine[]) => void,
) {
	if (action === "all") {
		onRowsChange([createSalesJournalLine(1)]);
		return;
	}

	const nextRows = rows.filter(
		(row) => !shouldClearSalesJournalAccountEntry(row, action),
	);
	onRowsChange(nextRows.length > 0 ? nextRows : [createSalesJournalLine(1)]);
}

function removeAccountRow(
	rowId: string,
	rows: SalesJournalLine[],
	onRowsChange: (rows: SalesJournalLine[]) => void,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);
	onRowsChange(nextRows.length > 0 ? nextRows : [createSalesJournalLine(1)]);
}
