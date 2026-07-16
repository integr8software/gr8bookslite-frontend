import { useCallback, useMemo, type ChangeEventHandler } from "react";
import {
	SalesJournalCurrencyOptions,
	SalesJournalStatusOptions,
	SalesJournalVatTypeOptions,
} from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import {
	createSalesJournalLine,
	formatSalesJournalAmount,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import type { useSalesJournalFormPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalFormPage";
import type {
	SalesJournalLine,
	SalesJournalLineField,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
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
	section: SalesJournalDetailsSection;
};

export type SalesJournalDetailsSection = "amounts" | "customer" | "references";

export function SalesJournalDetailsPage({
	page,
	section,
}: SalesJournalDetailsPageProps) {
	return (
		<>
			<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
				{section === "customer" ? <SalesJournalCustomerSection page={page} /> : null}
				{section === "amounts" ? <SalesJournalAmountsSection page={page} /> : null}
				{section === "references" ? (
					<SalesJournalReferencesSection page={page} />
				) : null}
			</section>

			<SalesJournalEntries page={page} />
		</>
	);
}

function SalesJournalCustomerSection({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="grid gap-4">
				<TextField
					label="Code"
					name="partyCode"
					value={page.values.partyCode}
					error={page.errors.partyCode}
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
				<TextAreaField
					label="Remarks"
					name="remarks"
					value={page.values.remarks}
					error={page.errors.remarks}
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
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="Name"
					name="partyName"
					value={page.values.partyName}
					error={page.errors.partyName}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="FX Rate"
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
					label="Terms"
					name="terms"
					value={page.values.terms}
					error={page.errors.terms}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
		</div>
	);
}

function SalesJournalAmountsSection({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="grid content-start gap-4">
				<ReadOnlyField
					label="Total Debit"
					value={formatSalesJournalAmount(page.totals.totalDebit)}
				/>
				<ReadOnlyField
					label="Total Credit"
					value={formatSalesJournalAmount(page.totals.totalCredit)}
				/>
				<ReadOnlyField
					label="Variance"
					value={formatSalesJournalAmount(Math.abs(page.totals.variance))}
				/>
			</div>
			<div className="grid content-start gap-4">
				<SelectField
					label="Status"
					name="status"
					value={page.values.status}
					error={page.errors.status}
					disabled={page.isReadonly}
					options={SalesJournalStatusOptions}
					onChange={page.handleInputChange}
				/>
				<ReadOnlyField
					label="Balance"
					value={page.totals.isBalanced ? "Balanced" : "Needs balancing"}
				/>
			</div>
		</div>
	);
}

function SalesJournalReferencesSection({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
	const firstLine = page.values.lines[0];

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="grid content-start gap-4">
				<TextField
					label="Trans No."
					name="documentNo"
					value={page.values.documentNo}
					error={page.errors.documentNo}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
				<TextField
					label="Document Date"
					name="documentDate"
					type="date"
					value={page.values.documentDate}
					error={page.errors.documentDate}
					disabled={page.isReadonly}
					onChange={page.handleInputChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<label className="block">
					<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
						Ref No.
					</span>
					<input
						className={fieldClassName}
						disabled={page.isReadonly || !firstLine}
						onChange={(event) => {
							if (firstLine) {
								page.updateLine(firstLine.id, "refNo", event.target.value);
							}
						}}
						value={firstLine?.refNo ?? ""}
					/>
				</label>
				<ReadOnlyField label="ProjectRef." value="" />
			</div>
		</div>
	);
}

function SalesJournalEntries({
	page,
}: {
	page: ReturnType<typeof useSalesJournalFormPage>;
}) {
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
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["accountCode", "accountTitle", "debit", "credit"].includes(
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
		page.updateLines([
			...page.values.lines,
			...Array.from({ length: count }, (_, index) =>
				createSalesJournalLine(page.values.lines.length + index + 1),
			),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			page.updateLines([createSalesJournalLine(1)]);
			return;
		}

		const nextRows = page.values.lines.filter(
			(row) => !shouldClearSalesJournalEntry(row, action),
		);
		page.updateLines(nextRows.length > 0 ? nextRows : [createSalesJournalLine(1)]);
	}

	function duplicateRow(rowId: string) {
		const rowIndex = page.values.lines.findIndex((row) => row.id === rowId);
		const row = page.values.lines[rowIndex];

		if (!row) {
			return;
		}

		const nextRows = [...page.values.lines];
		nextRows.splice(rowIndex + 1, 0, {
			...row,
			id: createSalesJournalLine(row.lineNumber + 1).id,
		});
		page.updateLines(nextRows);
	}

	function insertRow(rowId: string, position: "above" | "below") {
		const rowIndex = page.values.lines.findIndex((row) => row.id === rowId);

		if (rowIndex < 0) {
			return;
		}

		const nextRows = [...page.values.lines];
		nextRows.splice(
			position === "above" ? rowIndex : rowIndex + 1,
			0,
			createSalesJournalLine(rowIndex + 1),
		);
		page.updateLines(nextRows);
	}

	function moveRow(fromRowId: string, toRowId: string) {
		const fromIndex = page.values.lines.findIndex((row) => row.id === fromRowId);
		const toIndex = page.values.lines.findIndex((row) => row.id === toRowId);

		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
			return;
		}

		const nextRows = [...page.values.lines];
		const [movedRow] = nextRows.splice(fromIndex, 1);

		if (!movedRow) {
			return;
		}

		nextRows.splice(toIndex, 0, movedRow);
		page.updateLines(nextRows);
	}

	function removeRow(rowId: string) {
		const nextRows = page.values.lines.filter((row) => row.id !== rowId);
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
			rows={page.values.lines}
			summaryCells={{
				credit: formatSalesJournalAmount(page.totals.totalCredit),
				debit: formatSalesJournalAmount(page.totals.totalDebit),
			}}
			title="Details"
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

type SalesJournalColumnKind = "amount" | "dropdown" | "text";

type SalesJournalColumnConfig = {
	header: string;
	id: SalesJournalLineField;
	kind: SalesJournalColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type SalesJournalEntryUpdater = (
	rowId: string,
	field: SalesJournalLineField,
	value: string,
) => void;

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

	if (column.kind === "dropdown") {
		return (
			<EntryDropdown
				options={column.options ?? []}
				readOnly={isReadonly}
				value={value}
				onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
			/>
		);
	}

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

function EntryDropdown({
	onChange,
	options,
	readOnly,
	value,
}: {
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	readOnly: boolean;
	value: string;
}) {
	return (
		<AppAdvancedDropdown
			className={EntryDropdownClassName}
			value={value}
			options={options}
			placeholder=""
			readOnly={readOnly}
			onChange={(nextValue) => onChange(String(nextValue))}
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

function salesJournalDropdownOptions(
	options: readonly string[],
): AppAdvancedDropdownOption[] {
	return options.map((option) => ({
		label: option,
		name: option,
		value: option,
	}));
}

function salesJournalColumn(
	header: string,
	id: SalesJournalLineField,
	kind: SalesJournalColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): SalesJournalColumnConfig {
	return {
		header,
		id,
		kind,
		options,
		width,
		widthClassName,
	};
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
	salesJournalColumn("Account Code", "accountCode", "text", 150, "w-[9.5rem]"),
	salesJournalColumn("Account Title", "accountTitle", "text", 260, "w-[16rem]"),
	salesJournalColumn("Debit", "debit", "amount", 140, "w-[8.75rem]"),
	salesJournalColumn("Credit", "credit", "amount", 140, "w-[8.75rem]"),
	salesJournalColumn("Particulars", "particulars", "text", 260, "w-[16rem]"),
	salesJournalColumn("Party Code", "partyCode", "text", 150, "w-[9.5rem]"),
	salesJournalColumn("Party Name", "partyName", "text", 220, "w-[13.75rem]"),
	salesJournalColumn(
		"Responsibility Center",
		"responsibilityCenter",
		"text",
		190,
		"w-[12rem]",
	),
	salesJournalColumn("Ref No", "refNo", "text", 150, "w-[9.5rem]"),
	salesJournalColumn(
		"VAT Type",
		"vatType",
		"dropdown",
		150,
		"w-[9.5rem]",
		salesJournalDropdownOptions(SalesJournalVatTypeOptions),
	),
	salesJournalColumn("ATC Code", "atcCode", "text", 150, "w-[9.5rem]"),
];

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
			<input
				className={`${fieldClassName} bg-offwhite text-darknavy/70`}
				readOnly
				value={value}
			/>
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
