import {
	useCallback,
	useMemo,
	useState,
	type ChangeEventHandler,
	type ReactNode,
} from "react";
import { SalesJournalCurrencyOptions } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import {
	createSalesJournalItemEntry,
	createSalesJournalLine,
	formatSalesJournalAmount,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import type {
	SalesJournalItemEntry,
	SalesJournalItemEntryField,
	SalesJournalLine,
	SalesJournalLineField,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const fieldClassName =
	"app-theme-field h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";
const errorClassName = "mt-1 text-xs font-medium text-red-600";

type SalesJournalDetailsPageProps = {
	page: ReturnType<typeof useSalesJournalFormPage>;
};

export function SalesJournalDetailsPage({ page }: SalesJournalDetailsPageProps) {
	return (
		<>
			<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
				<SalesJournalHeaderFields page={page} />
			</section>

			<SalesJournalEntries page={page} />
		</>
	);
}

function SalesJournalHeaderFields({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	return (
		<div className="grid gap-x-8 gap-y-4 xl:grid-cols-3">
			<div className="grid content-start gap-4">
				<TextField
					label="Party Name"
					name="partyName"
					value={page.values.partyName}
					error={page.errors.partyName}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Address"
					name="address"
					value={page.values.address}
					error={page.errors.address}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Contact Person"
					name="contactPerson"
					value={page.values.contactPerson}
					error={page.errors.contactPerson}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Contact No"
					name="contactNo"
					value={page.values.contactNo}
					error={page.errors.contactNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Project Name"
					name="projectName"
					value={page.values.projectName}
					error={page.errors.projectName}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextAreaField
					label="Remarks"
					name="remarks"
					value={page.values.remarks}
					error={page.errors.remarks}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="Party Code"
					name="partyCode"
					value={page.values.partyCode}
					error={page.errors.partyCode}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Terms of Pyt"
					name="terms"
					value={page.values.terms}
					error={page.errors.terms}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Due Date"
					name="dueDate"
					type="date"
					value={page.values.dueDate}
					error={page.errors.dueDate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<SelectField
					label="Currency"
					name="currency"
					value={page.values.currency}
					error={page.errors.currency}
					disabled={page.isReadonly}
					options={SalesJournalCurrencyOptions}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="ER"
					name="exchangeRate"
					type="number"
					min="0"
					step="0.000001"
					value={String(page.values.exchangeRate)}
					error={page.errors.exchangeRate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Res Center"
					name="resCenter"
					value={page.values.resCenter}
					error={page.errors.resCenter}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="SI No"
					name="siNo"
					value={page.values.siNo}
					error={page.errors.siNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="SI Date"
					name="documentDate"
					type="date"
					value={page.values.documentDate}
					error={page.errors.documentDate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="SO No"
					name="soNo"
					value={page.values.soNo}
					error={page.errors.soNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="PO No."
					name="poNo"
					value={page.values.poNo}
					error={page.errors.poNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Sales Personnel"
					name="salesPersonnel"
					value={page.values.salesPersonnel}
					error={page.errors.salesPersonnel}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
		</div>
	);
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
		() => createColumnOptions(columns),
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
				duplicateItemRow(rowId, rows, page.updateItemEntries)
			}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={(rowId, position) =>
				insertItemRow(rowId, position, rows, page.updateItemEntries)
			}
			onMoveRow={(fromRowId, toRowId) =>
				moveRow(fromRowId, toRowId, rows, page.updateItemEntries)
			}
			onRemoveRow={(rowId) => removeItemRow(rowId, rows, page.updateItemEntries)}
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
		() => createSalesJournalColumns(page.isReadonly, updateEntry),
		[page.isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() => createColumnOptions(columns),
		[columns],
	);

	function addRows(count: number) {
		page.updateLines([
			...rows,
			...Array.from({ length: count }, (_, index) =>
				createSalesJournalLine(rows.length + index + 1),
			),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			page.updateLines([createSalesJournalLine(1)]);
			return;
		}

		const nextRows = rows.filter(
			(row) => !shouldClearSalesJournalEntry(row, action),
		);
		page.updateLines(nextRows.length > 0 ? nextRows : [createSalesJournalLine(1)]);
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
			id: createSalesJournalLine(row.lineNumber + 1).id,
		});
		page.updateLines(nextRows);
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
			createSalesJournalLine(rowIndex + 1),
		);
		page.updateLines(nextRows);
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
		page.updateLines(nextRows);
	}

	function removeRow(rowId: string) {
		const nextRows = rows.filter((row) => row.id !== rowId);
		page.updateLines(nextRows.length > 0 ? nextRows : [createSalesJournalLine(1)]);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description="Line items must balance before the sales journal can be saved."
			emptyRowLabel="entry"
			error={page.errors.lines ?? page.errors.balance}
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
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

type SalesJournalEntryTab = "accounts" | "items";

type SalesJournalItemColumnKind = "amount" | "readonlyAmount" | "text";

type SalesJournalItemColumnConfig = {
	header: string;
	id: SalesJournalItemEntryField | "vatInclusiveAmount";
	kind: SalesJournalItemColumnKind;
	width: number;
	widthClassName: string;
};

type SalesJournalColumnKind = "amount" | "text";

type SalesJournalColumnConfig = {
	header: string;
	id: SalesJournalLineField;
	kind: SalesJournalColumnKind;
	width: number;
	widthClassName: string;
};

type SalesJournalItemEntryUpdater = (
	rowId: string,
	updates: Partial<SalesJournalItemEntry>,
) => void;

type SalesJournalEntryUpdater = (
	rowId: string,
	field: SalesJournalLineField,
	value: string,
) => void;

function createSalesJournalItemColumns(
	isReadonly: boolean,
	onUpdateEntry: SalesJournalItemEntryUpdater,
): ModuleDataEntryColumn<SalesJournalItemEntry>[] {
	return SalesJournalItemColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => {
			if (column.id === "vatInclusiveAmount") {
				return (
					<EntryAmountInput
						value={formatSalesJournalAmount(getItemVatInclusiveAmount(row))}
						readOnly
						onValueChange={() => undefined}
					/>
				);
			}

			if (column.kind === "amount" || column.kind === "readonlyAmount") {
				return (
					<EntryAmountInput
						value={String(row[column.id])}
						readOnly={isReadonly || column.kind === "readonlyAmount"}
						onValueChange={(value) => onUpdateEntry(row.id, { [column.id]: value })}
					/>
				);
			}

			return (
				<EntryInput
					value={String(row[column.id])}
					readOnly={isReadonly}
					onChange={(value) => onUpdateEntry(row.id, { [column.id]: value })}
				/>
			);
		},
	}));
}

function createSalesJournalColumns(
	isReadonly: boolean,
	onUpdateEntry: SalesJournalEntryUpdater,
): ModuleDataEntryColumn<SalesJournalLine>[] {
	return SalesJournalColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<SalesJournalEntryCell
				column={column}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function SalesJournalEntryCell({
	column,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: SalesJournalColumnConfig;
	isReadonly: boolean;
	onUpdateEntry: SalesJournalEntryUpdater;
	row: SalesJournalLine;
}) {
	const value = String(row[column.id]);

	if (column.kind === "amount") {
		return (
			<EntryAmountInput
				value={formatSalesJournalAmount(Number(row[column.id] || 0))}
				readOnly={isReadonly}
				onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
			/>
		);
	}

	return (
		<EntryInput
			value={value}
			readOnly={isReadonly}
			onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
		/>
	);
}

function EntryInput({
	onChange,
	readOnly,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<input
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={entryCellControlClassName()}
		/>
	);
}

function EntryAmountInput({
	onValueChange,
	readOnly,
	value,
}: {
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<MoneyNumberField
			value={value}
			readOnly={readOnly}
			onValueChange={onValueChange}
			className={entryCellControlClassName("text-right tabular-nums")}
		/>
	);
}

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

function salesJournalColumn(
	header: string,
	id: SalesJournalLineField,
	kind: SalesJournalColumnKind,
	width: number,
	widthClassName: string,
): SalesJournalColumnConfig {
	return {
		header,
		id,
		kind,
		width,
		widthClassName,
	};
}

function salesJournalItemColumn(
	header: string,
	id: SalesJournalItemColumnConfig["id"],
	kind: SalesJournalItemColumnKind,
	width: number,
	widthClassName: string,
): SalesJournalItemColumnConfig {
	return {
		header,
		id,
		kind,
		width,
		widthClassName,
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

function recalculateSalesJournalItemEntry(
	entry: SalesJournalItemEntry,
): SalesJournalItemEntry {
	const rate = parseMoneyNumberInput(entry.rate);
	const quantity = parseMoneyNumberInput(entry.quantity);
	const amount = rate * quantity;
	const nextAmount = amount > 0 ? amount : parseMoneyNumberInput(entry.amount);
	const vatAmount =
		nextAmount > 0
			? nextAmount * 0.12
			: parseMoneyNumberInput(entry.vatAmount);
	const discountAmount = parseMoneyNumberInput(entry.discountAmount);
	const netAmount = Math.max(nextAmount + vatAmount - discountAmount, 0);

	return {
		...entry,
		amount: nextAmount.toFixed(2),
		vatAmount: vatAmount.toFixed(2),
		netAmount: netAmount.toFixed(2),
	};
}

function calculateSalesJournalItemTotals(rows: SalesJournalItemEntry[]) {
	return rows.reduce(
		(totals, row) => {
			const amount = parseMoneyNumberInput(row.amount);
			const vatAmount = parseMoneyNumberInput(row.vatAmount);

			return {
				amount: totals.amount + amount,
				discountAmount:
					totals.discountAmount + parseMoneyNumberInput(row.discountAmount),
				netAmount: totals.netAmount + parseMoneyNumberInput(row.netAmount),
				vatAmount: totals.vatAmount + vatAmount,
				vatInclusiveAmount: totals.vatInclusiveAmount + amount + vatAmount,
			};
		},
		{
			amount: 0,
			discountAmount: 0,
			netAmount: 0,
			vatAmount: 0,
			vatInclusiveAmount: 0,
		},
	);
}

function getItemVatInclusiveAmount(row: SalesJournalItemEntry) {
	return parseMoneyNumberInput(row.amount) + parseMoneyNumberInput(row.vatAmount);
}

function salesJournalItemEntryHasData(entry: SalesJournalItemEntry) {
	return (
		entry.professionalServiceType.trim().length > 0 ||
		parseMoneyNumberInput(entry.rate) > 0 ||
		parseMoneyNumberInput(entry.quantity) > 0 ||
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.vatAmount) > 0 ||
		parseMoneyNumberInput(entry.discountAmount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0
	);
}

function salesJournalItemEntryIsComplete(entry: SalesJournalItemEntry) {
	return (
		entry.professionalServiceType.trim().length > 0 &&
		parseMoneyNumberInput(entry.amount) > 0
	);
}

function shouldClearSalesJournalItemEntry(
	entry: SalesJournalItemEntry,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return salesJournalItemEntryHasData(entry);
	}

	if (action === "incomplete") {
		return (
			salesJournalItemEntryHasData(entry) &&
			!salesJournalItemEntryIsComplete(entry)
		);
	}

	return !salesJournalItemEntryHasData(entry);
}

function clearItemRows(
	action: ModuleDataEntryClearAction,
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

function duplicateItemRow(
	rowId: string,
	rows: SalesJournalItemEntry[],
	onRowsChange: (rows: SalesJournalItemEntry[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	const row = rows[rowIndex];

	if (!row) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(rowIndex + 1, 0, {
		...row,
		id: createSalesJournalItemEntry().id,
	});
	onRowsChange(nextRows);
}

function insertItemRow(
	rowId: string,
	position: "above" | "below",
	rows: SalesJournalItemEntry[],
	onRowsChange: (rows: SalesJournalItemEntry[]) => void,
) {
	const rowIndex = rows.findIndex((row) => row.id === rowId);

	if (rowIndex < 0) {
		return;
	}

	const nextRows = [...rows];
	nextRows.splice(
		position === "above" ? rowIndex : rowIndex + 1,
		0,
		createSalesJournalItemEntry(),
	);
	onRowsChange(nextRows);
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

function salesJournalEntryHasData(entry: SalesJournalLine) {
	return (
		entry.accountCode.trim().length > 0 ||
		entry.accountTitle.trim().length > 0 ||
		Number(entry.debit || 0) > 0 ||
		Number(entry.credit || 0) > 0 ||
		entry.particulars.trim().length > 0 ||
		entry.partyCode.trim().length > 0 ||
		entry.partyName.trim().length > 0 ||
		entry.responsibilityCenter.trim().length > 0 ||
		entry.refNo.trim().length > 0 ||
		entry.atcCode.trim().length > 0
	);
}

function salesJournalEntryIsComplete(entry: SalesJournalLine) {
	return (
		entry.accountCode.trim().length > 0 &&
		entry.accountTitle.trim().length > 0 &&
		(Number(entry.debit || 0) > 0 || Number(entry.credit || 0) > 0)
	);
}

function shouldClearSalesJournalEntry(
	entry: SalesJournalLine,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return salesJournalEntryHasData(entry);
	}

	if (action === "incomplete") {
		return salesJournalEntryHasData(entry) && !salesJournalEntryIsComplete(entry);
	}

	return !salesJournalEntryHasData(entry);
}

const SalesJournalColumnConfigs = [
	salesJournalColumn("Acct Code", "accountCode", "text", 150, "w-[9.5rem]"),
	salesJournalColumn("Acct Title", "accountTitle", "text", 260, "w-[16rem]"),
	salesJournalColumn("Debit", "debit", "amount", 140, "w-[8.75rem]"),
	salesJournalColumn("Credit", "credit", "amount", 140, "w-[8.75rem]"),
];

const SalesJournalItemColumnConfigs = [
	salesJournalItemColumn(
		"Professional Service Type",
		"professionalServiceType",
		"text",
		260,
		"w-[16rem]",
	),
	salesJournalItemColumn("Rate", "rate", "amount", 140, "w-[8.75rem]"),
	salesJournalItemColumn("Qty", "quantity", "amount", 100, "w-[6.25rem]"),
	salesJournalItemColumn("Amount", "amount", "readonlyAmount", 140, "w-[8.75rem]"),
	salesJournalItemColumn("VAT", "vatAmount", "amount", 130, "w-[8.125rem]"),
	salesJournalItemColumn(
		"VAT Inc.",
		"vatInclusiveAmount",
		"readonlyAmount",
		140,
		"w-[8.75rem]",
	),
	salesJournalItemColumn(
		"Disct",
		"discountAmount",
		"amount",
		130,
		"w-[8.125rem]",
	),
	salesJournalItemColumn("Net Amt", "netAmount", "readonlyAmount", 150, "w-[9.375rem]"),
];

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

type FieldProps = {
	disabled: boolean;
	error?: string;
	label: string;
	name: string;
	onChange: ChangeEventHandler<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>;
	value: string;
	type?: string;
	min?: string;
	step?: string;
};

function TextField({
	disabled,
	error,
	label,
	name,
	onChange,
	value,
	type = "text",
	min,
	step,
}: FieldProps) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
			<input
				className={fieldClassName}
				disabled={disabled}
				min={min}
				name={name}
				onChange={onChange}
				step={step}
				type={type}
				value={value}
			/>
			{error ? <span className={errorClassName}>{error}</span> : null}
		</label>
	);
}

function TextAreaField({
	disabled,
	error,
	label,
	name,
	onChange,
	value,
}: FieldProps) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
			<textarea
				className={`${fieldClassName} min-h-28 py-3`}
				disabled={disabled}
				name={name}
				onChange={onChange}
				value={value}
			/>
			{error ? <span className={errorClassName}>{error}</span> : null}
			<span className="mt-1 block text-xs font-medium text-darknavy/45">
				Characters remaining: {Math.max(250 - value.length, 0)}
			</span>
		</label>
	);
}

function SelectField({
	disabled,
	error,
	label,
	name,
	onChange,
	options,
	value,
}: FieldProps & { options: readonly string[] }) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
			<select
				className={fieldClassName}
				disabled={disabled}
				name={name}
				onChange={onChange}
				value={value}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			{error ? <span className={errorClassName}>{error}</span> : null}
		</label>
	);
}
