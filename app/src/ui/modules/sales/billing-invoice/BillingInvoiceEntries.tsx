import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
	billingInvoiceEntryHasData,
	billingInvoiceEntryIsComplete,
	createBlankBillingInvoiceAccountEntry,
	createBlankBillingInvoiceLineEntry,
	formatBillingInvoiceAmount,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
	type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
	createBillingInvoiceAccountEntryColumns,
	createBillingInvoiceItemEntryColumns,
} from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceEntryColumns";

type BillingInvoiceEntriesTab = "accounts" | "items";

type BillingInvoiceEntriesProps = {
	accountRows: BillingInvoiceAccountEntry[];
	isReadonly: boolean;
	rows: BillingInvoiceLineEntry[];
	onAccountRowsChange: (rows: BillingInvoiceAccountEntry[]) => void;
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void;
};

export function BillingInvoiceEntries({
	accountRows,
	isReadonly,
	onAccountRowsChange,
	onRowsChange,
	rows,
}: BillingInvoiceEntriesProps) {
	const [activeTab, setActiveTab] = useState<BillingInvoiceEntriesTab>("items");
	const tabs = (
		<BillingInvoiceEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />
	);

	if (activeTab === "accounts") {
		return (
			<BillingInvoiceAccountEntries
				isReadonly={isReadonly}
				rows={accountRows}
				title={tabs}
				onRowsChange={onAccountRowsChange}
			/>
		);
	}

	return (
		<BillingInvoiceItemEntries
			isReadonly={isReadonly}
			rows={rows}
			title={tabs}
			onRowsChange={onRowsChange}
		/>
	);
}

function BillingInvoiceEntryTabs({
	activeTab,
	onTabChange,
}: {
	activeTab: BillingInvoiceEntriesTab;
	onTabChange: (tab: BillingInvoiceEntriesTab) => void;
}) {
	return (
		<div
			role="tablist"
			aria-label="Billing invoice row entry sections"
			className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
		>
			{BillingInvoiceEntryTabsList.map((tab) => {
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

function BillingInvoiceItemEntries({
	isReadonly,
	onRowsChange,
	rows,
	title,
}: {
	isReadonly: boolean;
	rows: BillingInvoiceLineEntry[];
	title: ReactNode;
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void;
}) {
	const updateEntry = useCallback(
		(rowId: string, updates: Partial<BillingInvoiceLineEntry>) => {
			onRowsChange(
				rows.map((row) =>
					row.id === rowId ? recalculateEntry({ ...row, ...updates }) : row,
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
		() => createColumnOptions(columns),
		[columns],
	);

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="item"
			exportOptions={EntryExportOptions}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			title={title}
			onAddRows={(count) =>
				onRowsChange([
					...rows,
					...Array.from({ length: count }, () =>
						createBlankBillingInvoiceLineEntry(),
					),
				])
			}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) => clearLineRows(action, rows, onRowsChange)}
			onDuplicateRow={(rowId) =>
				duplicateLineRow(rowId, rows, onRowsChange)
			}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				insertLineRow(rowId, position, rows, onRowsChange)
			}
			onMoveRow={(fromRowId, toRowId) =>
				moveRow(fromRowId, toRowId, rows, onRowsChange)
			}
			onRemoveRow={(rowId) => removeLineRow(rowId, rows, onRowsChange)}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function BillingInvoiceAccountEntries({
	isReadonly,
	onRowsChange,
	rows,
	title,
}: {
	isReadonly: boolean;
	rows: BillingInvoiceAccountEntry[];
	title: ReactNode;
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
	const totals = useMemo(() => calculateAccountEntryTotals(rows), [rows]);
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

	function toggleColumnVisibility(columnId: string, isVisible: boolean) {
		if (!isVisible && BillingInvoiceAccountingProtectedColumnIds.has(columnId)) {
			return;
		}

		setVisibleColumnIds((currentVisibleIds) =>
			updateVisibleColumnIds(
				currentVisibleIds,
				allColumns.map((column) => column.id),
				columnId,
				isVisible,
			),
		);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description=""
			emptyRowLabel="account"
			exportOptions={EntryExportOptions}
			footerDetails={
				<span
					className={joinClasses(
						"text-sm font-semibold",
						totals.debit === totals.credit
							? "text-emerald-700"
							: "text-red-600",
					)}
				>
					Difference: {formatBillingInvoiceAmount(Math.abs(totals.debit - totals.credit))}
				</span>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				credit: formatBillingInvoiceAmount(totals.credit),
				debit: formatBillingInvoiceAmount(totals.debit),
			}}
			summaryRowHeader="Totals"
			title={title}
			onAddRows={(count) =>
				onRowsChange([
					...rows,
					...Array.from({ length: count }, () =>
						createBlankBillingInvoiceAccountEntry(),
					),
				])
			}
			onAutoColumnWidth={() => undefined}
			onClearRows={(action) => clearAccountRows(action, rows, onRowsChange)}
			onDuplicateRow={(rowId) =>
				duplicateAccountRow(rowId, rows, onRowsChange)
			}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				insertAccountRow(rowId, position, rows, onRowsChange)
			}
			onMoveRow={(fromRowId, toRowId) =>
				moveRow(fromRowId, toRowId, rows, onRowsChange)
			}
			onRemoveRow={(rowId) => removeAccountRow(rowId, rows, onRowsChange)}
			onToggleColumnVisibility={toggleColumnVisibility}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function recalculateEntry(
	entry: BillingInvoiceLineEntry,
): BillingInvoiceLineEntry {
	const unitPrice = parseMoneyNumberInput(entry.amount);
	const quantity = parseMoneyNumberInput(entry.quantity);
	const discountAmount = parseMoneyNumberInput(entry.discountAmount);
	const netAmount = unitPrice > 0 ? unitPrice * Math.max(quantity, 1) : parseMoneyNumberInput(entry.netAmount);
	const vatAmount = parseMoneyNumberInput(entry.vatAmount);
	const grossAmount = Math.max(netAmount + vatAmount - discountAmount, 0);

	return {
		...entry,
		netAmount: netAmount.toFixed(2),
		grossAmount: grossAmount.toFixed(2),
	};
}

function createColumnOptions<TRow>(
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

function updateVisibleColumnIds(
	visibleColumnIds: string[],
	columnOrder: string[],
	columnId: string,
	isVisible: boolean,
) {
	if (isVisible) {
		const nextVisibleIds = new Set([...visibleColumnIds, columnId]);
		return columnOrder.filter((currentColumnId) =>
			nextVisibleIds.has(currentColumnId),
		);
	}

	if (visibleColumnIds.length <= 1) {
		return visibleColumnIds;
	}

	return visibleColumnIds.filter((currentColumnId) => currentColumnId !== columnId);
}

function clearLineRows(
	action: ModuleDataEntryClearAction,
	rows: BillingInvoiceLineEntry[],
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void,
) {
	if (action === "all") {
		onRowsChange([createBlankBillingInvoiceLineEntry()]);
		return;
	}

	const nextRows = rows.filter((row) => !shouldClearLineEntry(row, action));
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankBillingInvoiceLineEntry()],
	);
}

function duplicateLineRow(
	rowId: string,
	rows: BillingInvoiceLineEntry[],
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createBlankBillingInvoiceLineEntry().id,
	});
	onRowsChange(nextRows);
}

function insertLineRow(
	rowId: string,
	position: "above" | "below",
	rows: BillingInvoiceLineEntry[],
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createBlankBillingInvoiceLineEntry(),
	);
	onRowsChange(nextRows);
}

function removeLineRow(
	rowId: string,
	rows: BillingInvoiceLineEntry[],
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankBillingInvoiceLineEntry()],
	);
}

function clearAccountRows(
	action: ModuleDataEntryClearAction,
	rows: BillingInvoiceAccountEntry[],
	onRowsChange: (rows: BillingInvoiceAccountEntry[]) => void,
) {
	if (action === "all") {
		onRowsChange([createBlankBillingInvoiceAccountEntry()]);
		return;
	}

	const nextRows = rows.filter((row) => !shouldClearAccountEntry(row, action));
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankBillingInvoiceAccountEntry()],
	);
}

function duplicateAccountRow(
	rowId: string,
	rows: BillingInvoiceAccountEntry[],
	onRowsChange: (rows: BillingInvoiceAccountEntry[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createBlankBillingInvoiceAccountEntry().id,
	});
	onRowsChange(nextRows);
}

function insertAccountRow(
	rowId: string,
	position: "above" | "below",
	rows: BillingInvoiceAccountEntry[],
	onRowsChange: (rows: BillingInvoiceAccountEntry[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createBlankBillingInvoiceAccountEntry(),
	);
	onRowsChange(nextRows);
}

function removeAccountRow(
	rowId: string,
	rows: BillingInvoiceAccountEntry[],
	onRowsChange: (rows: BillingInvoiceAccountEntry[]) => void,
) {
	const nextRows = rows.filter((row) => row.id !== rowId);
	onRowsChange(
		nextRows.length > 0 ? nextRows : [createBlankBillingInvoiceAccountEntry()],
	);
}

function moveRow<TRow extends { id: string }>(
	fromRowId: string,
	toRowId: string,
	rows: TRow[],
	onRowsChange: (rows: TRow[]) => void,
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

function calculateAccountEntryTotals(rows: BillingInvoiceAccountEntry[]) {
	return rows.reduce(
		(totals, row) => ({
			credit: totals.credit + parseMoneyNumberInput(row.credit),
			debit: totals.debit + parseMoneyNumberInput(row.debit),
		}),
		{ credit: 0, debit: 0 },
	);
}

function shouldClearLineEntry(
	entry: BillingInvoiceLineEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return billingInvoiceEntryHasData(entry);
	}

	if (action === "incomplete") {
		return billingInvoiceEntryHasData(entry) && !billingInvoiceEntryIsComplete(entry);
	}

	return !billingInvoiceEntryHasData(entry);
}

function shouldClearAccountEntry(
	entry: BillingInvoiceAccountEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	const hasData =
		entry.accountCode.trim() !== "" ||
		entry.accountTitle.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		entry.vatType.trim() !== "" ||
		entry.atcCode.trim() !== "" ||
		entry.partyCode.trim() !== "" ||
		entry.partyName.trim() !== "" ||
		entry.responsibilityCenter.trim() !== "" ||
		entry.refNo.trim() !== "" ||
		entry.debit.trim() !== "" ||
		entry.credit.trim() !== "";
	const isComplete =
		entry.accountCode.trim() !== "" ||
		entry.accountTitle.trim() !== "" ||
		parseMoneyNumberInput(entry.debit) > 0 ||
		parseMoneyNumberInput(entry.credit) > 0;

	if (action === "with-data") {
		return hasData;
	}

	if (action === "incomplete") {
		return hasData && !isComplete;
	}

	return !hasData;
}

const EntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];

const BillingInvoiceEntryTabsList = [
	{ id: "items", label: "Item Entry" },
	{ id: "accounts", label: "Account Entry" },
] satisfies Array<{
	id: BillingInvoiceEntriesTab;
	label: string;
}>;

const BillingInvoiceAccountingDefaultVisibleColumnIds = [
	"accountTitle",
	"debit",
	"credit",
	"particulars",
];

const BillingInvoiceAccountingProtectedColumnIds = new Set([
	"accountTitle",
	"debit",
	"credit",
]);
