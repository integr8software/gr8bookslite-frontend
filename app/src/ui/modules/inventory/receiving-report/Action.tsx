"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { Boxes, Save } from "lucide-react";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	MoneyNumberField,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleDataEntry,
	type ModuleDataEntryClearAction,
	type ModuleDataEntryColumn,
	type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const ReceivingReportHref = "/inventory/receiving-report";

type ReceivingReportActionMode = "add" | "edit" | "view";
type ReceivingReportSection = "vendor" | "amounts" | "references";
type ReceivingReportLineField = keyof ReceivingReportLine;
type ReceivingReportColumnKind = "amount" | "date" | "dropdown" | "text";

type ReceivingReportFormValues = {
	vceCode: string;
	vceName: string;
	currency: string;
	exchangeRate: string;
	address: string;
	contactNo: string;
	deliveryDate: string;
	remarks: string;
	defaultAccount: string;
	grossAmount: string;
	discountAmount: string;
	vatAmount: string;
	ewtAmount: string;
	netAmount: string;
	warehouse: string;
	status: string;
	transNo: string;
	documentDate: string;
	poNo: string;
	siNo: string;
	importationRefNo: string;
	projectRef: string;
	projectName: string;
	pjNo: string;
	lines: ReceivingReportLine[];
};

type ReceivingReportLine = {
	id: string;
	itemCode: string;
	barcode: string;
	description: string;
	itemCategory: string;
	serialNo: string;
	warehouse: string;
	poQty: string;
	rrQty: string;
	uom: string;
	expiryDate: string;
	freightCost: string;
	cost: string;
	grossAmount: string;
	vatAmount: string;
	discountAmount: string;
	ewtAmount: string;
	atc: string;
	netAmount: string;
	vatable: string;
	vatInclusive: string;
	withEwt: string;
	responsibilityCenter: string;
};

type ReceivingReportColumnConfig = {
	header: string;
	id: ReceivingReportLineField;
	kind: ReceivingReportColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type ReceivingReportEntryUpdater = (
	rowId: string,
	field: ReceivingReportLineField,
	value: string,
) => void;

export function ReceivingReportAction() {
	const router = useRouter();
	const pathname = usePathname();
	const mode = getActionMode(pathname);
	const isReadonly = mode === "view";
	const [activeTab, setActiveTab] = useState<ReceivingReportSection>("vendor");
	const [values, setValues] = useState<ReceivingReportFormValues>(
		createInitialReceivingReportValues,
	);
	const totals = useMemo(() => calculateReceivingReportTotals(values.lines), [
		values.lines,
	]);

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) {
		const { name, value } = event.target;

		setValues((current) => ({
			...current,
			[name]: value,
		}));
	}

	function updateLine(
		rowId: string,
		field: ReceivingReportLineField,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: current.lines.map((line) =>
				line.id === rowId ? { ...line, [field]: value } : line,
			),
		}));
	}

	function updateLines(lines: ReceivingReportLine[]) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, lines }));
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		router.push(ReceivingReportHref);
	}

	return (
		<form className="grid gap-5" onSubmit={handleSubmit}>
			<ReceivingReportHeader mode={mode} isReadonly={isReadonly} />
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Receiving report sections"
				tabs={ReceivingReportTabs}
				onTabChange={setActiveTab}
			/>
			<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
				{activeTab === "vendor" ? (
					<ReceivingReportVendorSection
						isReadonly={isReadonly}
						values={values}
						onChange={handleInputChange}
					/>
				) : null}
				{activeTab === "amounts" ? (
					<ReceivingReportAmountsSection
						isReadonly={isReadonly}
						totals={totals}
						values={values}
						onChange={handleInputChange}
					/>
				) : null}
				{activeTab === "references" ? (
					<ReceivingReportReferencesSection
						isReadonly={isReadonly}
						values={values}
						onChange={handleInputChange}
					/>
				) : null}
			</section>
			<ReceivingReportEntries
				isReadonly={isReadonly}
				rows={values.lines}
				totals={totals}
				onRowsChange={updateLines}
				onUpdateLine={updateLine}
			/>
		</form>
	);
}

function ReceivingReportHeader({
	isReadonly,
	mode,
}: {
	isReadonly: boolean;
	mode: ReceivingReportActionMode;
}) {
	const copy = ReceivingReportActionCopy[mode];

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={copy.title}
			description={copy.description}
			eyebrow={
				<>
					<Boxes className="h-3.5 w-3.5" aria-hidden="true" />
					Inventory transaction
				</>
			}
			actions={
				<div className="flex flex-wrap gap-2">
					<Link
						href={ReceivingReportHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						Back
					</Link>
					{!isReadonly ? (
						<button type="submit" className={moduleHeaderActionClassNames.primary}>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					) : null}
				</div>
			}
		/>
	);
}

function ReceivingReportVendorSection({
	isReadonly,
	onChange,
	values,
}: ReceivingReportSectionProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<div className="grid content-start gap-4">
				<TextField
					label="Party Code"
					name="vceCode"
					value={values.vceCode}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="Party Code"
					name="vceName"
					value={values.vceName}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
					<SelectField
						label="Currency"
						name="currency"
						value={values.currency}
						disabled={isReadonly}
						options={CurrencyOptions}
						onChange={onChange}
					/>
					<TextField
						label="Exchange Rate"
						name="exchangeRate"
						value={values.exchangeRate}
						disabled={isReadonly}
						onChange={onChange}
					/>
				</div>
				<TextField
					label="Address"
					name="address"
					value={values.address}
					disabled={isReadonly}
					onChange={onChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="Contact No."
					name="contactNo"
					value={values.contactNo}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="Delivery Date"
					name="deliveryDate"
					type="date"
					value={values.deliveryDate}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextAreaField
					label="Remarks"
					name="remarks"
					value={values.remarks}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<SelectField
					label="Default Account"
					name="defaultAccount"
					value={values.defaultAccount}
					disabled={isReadonly}
					options={DefaultAccountOptions}
					onChange={onChange}
				/>
			</div>
		</div>
	);
}

function ReceivingReportAmountsSection({
	isReadonly,
	onChange,
	totals,
	values,
}: ReceivingReportSectionProps & { totals: ReceivingReportTotals }) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<div className="grid content-start gap-4">
				<ReadOnlyField label="Gross Amount" value={formatAmount(totals.grossAmount)} />
				<ReadOnlyField
					label="Discount Amount"
					value={formatAmount(totals.discountAmount)}
				/>
				<ReadOnlyField label="VAT Amount" value={formatAmount(totals.vatAmount)} />
				<ReadOnlyField label="EWT Amount" value={formatAmount(totals.ewtAmount)} />
				<ReadOnlyField label="Net Amount" value={formatAmount(totals.netAmount)} />
			</div>
			<div className="grid content-start gap-4">
				<SelectField
					label="Warehouse"
					name="warehouse"
					value={values.warehouse}
					disabled={isReadonly}
					options={WarehouseOptions}
					onChange={onChange}
				/>
				<SelectField
					label="Status"
					name="status"
					value={values.status}
					disabled={isReadonly}
					options={StatusOptions}
					onChange={onChange}
				/>
			</div>
		</div>
	);
}

function ReceivingReportReferencesSection({
	isReadonly,
	onChange,
	values,
}: ReceivingReportSectionProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<div className="grid content-start gap-4">
				<TextField
					label="Trans No."
					name="transNo"
					value={values.transNo}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="Document Date"
					name="documentDate"
					type="date"
					value={values.documentDate}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="PO No."
					name="poNo"
					value={values.poNo}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="SI No."
					name="siNo"
					value={values.siNo}
					disabled={isReadonly}
					onChange={onChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<TextField
					label="Importation Ref No."
					name="importationRefNo"
					value={values.importationRefNo}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="ProjectRef."
					name="projectRef"
					value={values.projectRef}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="Project Name"
					name="projectName"
					value={values.projectName}
					disabled={isReadonly}
					onChange={onChange}
				/>
				<TextField
					label="PJ No."
					name="pjNo"
					value={values.pjNo}
					disabled={isReadonly}
					onChange={onChange}
				/>
			</div>
		</div>
	);
}

function ReceivingReportEntries({
	isReadonly,
	onRowsChange,
	onUpdateLine,
	rows,
	totals,
}: {
	isReadonly: boolean;
	onRowsChange: (rows: ReceivingReportLine[]) => void;
	onUpdateLine: ReceivingReportEntryUpdater;
	rows: ReceivingReportLine[];
	totals: ReceivingReportTotals;
}) {
	const updateEntry = useCallback(
		(rowId: string, field: ReceivingReportLineField, value: string) => {
			onUpdateLine(rowId, field, value);
		},
		[onUpdateLine],
	);
	const columns = useMemo<ModuleDataEntryColumn<ReceivingReportLine>[]>(
		() => createReceivingReportColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "description", "rrQty"].includes(column.id),
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
			...Array.from({ length: count }, () => createReceivingReportLine()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createReceivingReportLine()]);
			return;
		}

		const nextRows = rows.filter(
			(row) => !shouldClearReceivingReportEntry(row, action),
		);
		onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportLine()]);
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
			id: createReceivingReportLine().id,
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
			createReceivingReportLine(),
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
		onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportLine()]);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description="Record received inventory quantities, costs, taxes, and warehouse details."
			emptyRowLabel="received item"
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Gross: {formatAmount(totals.grossAmount)}</span>
					<span>VAT: {formatAmount(totals.vatAmount)}</span>
					<span>Net: {formatAmount(totals.netAmount)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				discountAmount: formatAmount(totals.discountAmount),
				ewtAmount: formatAmount(totals.ewtAmount),
				grossAmount: formatAmount(totals.grossAmount),
				netAmount: formatAmount(totals.netAmount),
				vatAmount: formatAmount(totals.vatAmount),
			}}
			title="Receiving Report Details"
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

function createReceivingReportColumns(
	isReadonly: boolean,
	onUpdateEntry: ReceivingReportEntryUpdater,
): ModuleDataEntryColumn<ReceivingReportLine>[] {
	return ReceivingReportColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<ReceivingReportEntryCell
				column={column}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function ReceivingReportEntryCell({
	column,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: ReceivingReportColumnConfig;
	isReadonly: boolean;
	onUpdateEntry: ReceivingReportEntryUpdater;
	row: ReceivingReportLine;
}) {
	const value = row[column.id];

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
				value={value}
				readOnly={isReadonly}
				onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
			/>
		);
	}

	return (
		<EntryInput
			type={column.kind === "date" ? "date" : "text"}
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
	type,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	type: "date" | "text";
	value: string;
}) {
	return (
		<input
			type={type}
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

type ReceivingReportSectionProps = {
	isReadonly: boolean;
	onChange: (
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => void;
	values: ReceivingReportFormValues;
};

type FieldProps = {
	disabled: boolean;
	label: string;
	name: string;
	onChange: ReceivingReportSectionProps["onChange"];
	value: string;
	type?: string;
};

function TextField({
	disabled,
	label,
	name,
	onChange,
	type = "text",
	value,
}: FieldProps) {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
				{label}
			</span>
			<input
				className={fieldClassName}
				disabled={disabled}
				name={name}
				onChange={onChange}
				type={type}
				value={value}
			/>
		</label>
	);
}

function TextAreaField({
	disabled,
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
			<span className="mt-1 block text-xs font-medium text-darknavy/45">
				Characters remaining: {Math.max(250 - value.length, 0)}
			</span>
		</label>
	);
}

function SelectField({
	disabled,
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
				className={`${fieldClassName} bg-offwhite text-right tabular-nums text-darknavy/70`}
				readOnly
				value={value}
			/>
		</label>
	);
}

type ReceivingReportTotals = {
	discountAmount: number;
	ewtAmount: number;
	grossAmount: number;
	netAmount: number;
	vatAmount: number;
};

function calculateReceivingReportTotals(
	lines: ReceivingReportLine[],
): ReceivingReportTotals {
	return lines.reduce(
		(totals, line) => ({
			discountAmount:
				totals.discountAmount + parseMoneyNumberInput(line.discountAmount),
			ewtAmount: totals.ewtAmount + parseMoneyNumberInput(line.ewtAmount),
			grossAmount: totals.grossAmount + parseMoneyNumberInput(line.grossAmount),
			netAmount: totals.netAmount + parseMoneyNumberInput(line.netAmount),
			vatAmount: totals.vatAmount + parseMoneyNumberInput(line.vatAmount),
		}),
		{
			discountAmount: 0,
			ewtAmount: 0,
			grossAmount: 0,
			netAmount: 0,
			vatAmount: 0,
		},
	);
}

function createInitialReceivingReportValues(): ReceivingReportFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		vceCode: "",
		vceName: "",
		currency: "PHP",
		exchangeRate: "1.0000",
		address: "",
		contactNo: "",
		deliveryDate: today,
		remarks: "",
		defaultAccount: "--Select Credit Account--",
		grossAmount: "0.0000",
		discountAmount: "0.0000",
		vatAmount: "0.0000",
		ewtAmount: "0.0000",
		netAmount: "0.0000",
		warehouse: "Laguna",
		status: "Draft",
		transNo: "",
		documentDate: today,
		poNo: "",
		siNo: "",
		importationRefNo: "",
		projectRef: "",
		projectName: "",
		pjNo: "",
		lines: [createReceivingReportLine()],
	};
}

function createReceivingReportLine(): ReceivingReportLine {
	return {
		id: `rr-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		barcode: "",
		description: "",
		itemCategory: "",
		serialNo: "",
		warehouse: "Laguna",
		poQty: "0.00",
		rrQty: "0.00",
		uom: "",
		expiryDate: "",
		freightCost: "0.00",
		cost: "0.00",
		grossAmount: "0.0000",
		vatAmount: "0.0000",
		discountAmount: "0.00",
		ewtAmount: "0.0000",
		atc: "",
		netAmount: "0.0000",
		vatable: "False",
		vatInclusive: "False",
		withEwt: "False",
		responsibilityCenter: "",
	};
}

function receivingReportColumn(
	header: string,
	id: ReceivingReportLineField,
	kind: ReceivingReportColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): ReceivingReportColumnConfig {
	return {
		header,
		id,
		kind,
		options,
		width,
		widthClassName,
	};
}

function dropdownOptions(options: readonly string[]): AppAdvancedDropdownOption[] {
	return options.map((option) => ({
		label: option,
		name: option,
		value: option,
	}));
}

function receivingReportEntryHasData(entry: ReceivingReportLine) {
	return Object.entries(entry).some(([key, value]) => {
		if (key === "id") {
			return false;
		}

		return String(value).trim().length > 0 && !DefaultEmptyValues.has(String(value));
	});
}

function receivingReportEntryIsComplete(entry: ReceivingReportLine) {
	return (
		entry.itemCode.trim().length > 0 &&
		entry.description.trim().length > 0 &&
		parseMoneyNumberInput(entry.rrQty) > 0
	);
}

function shouldClearReceivingReportEntry(
	entry: ReceivingReportLine,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return receivingReportEntryHasData(entry);
	}

	if (action === "incomplete") {
		return (
			receivingReportEntryHasData(entry) && !receivingReportEntryIsComplete(entry)
		);
	}

	return !receivingReportEntryHasData(entry);
}

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

function formatAmount(value: number) {
	return new Intl.NumberFormat("en-PH", {
		minimumFractionDigits: 4,
		maximumFractionDigits: 4,
	}).format(value);
}

function getActionMode(pathname: string): ReceivingReportActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

const ReceivingReportTabs = [
	{ id: "vendor", label: "Vendor / Delivery" },
	{ id: "amounts", label: "Amounts / Warehouse" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<ReceivingReportSection>[];

const ReceivingReportActionCopy = {
	add: {
		title: "Add Receiving Report",
		description:
			"Complete vendor details, receiving references, warehouse amounts, and received item entries before saving.",
	},
	edit: {
		title: "Edit Receiving Report",
		description:
			"Update vendor details, warehouse amounts, references, and received item entries.",
	},
	view: {
		title: "View Receiving Report",
		description:
			"Review the receiving report details, references, warehouse totals, and item entries.",
	},
} satisfies Record<
	ReceivingReportActionMode,
	{ description: string; title: string }
>;

const CurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;
const WarehouseOptions = ["Laguna", "Manila", "Cebu", "Davao"] as const;
const StatusOptions = ["Draft", "Open", "Approved", "Closed", "Cancelled"] as const;
const DefaultAccountOptions = [
	"--Select Credit Account--",
	"Accounts Payable - Trade",
	"Goods Received Not Invoiced",
	"Inventory Clearing",
] as const;
const UomOptions = ["", "PCS", "BOX", "KG", "LTR"] as const;
const BooleanOptions = ["False", "True"] as const;
const AtcOptions = ["", "WI010", "WC158", "WC160"] as const;
const ResponsibilityCenterOptions = ["", "Warehouse", "Purchasing", "Operations"] as const;
const DefaultEmptyValues = new Set(["0.00", "0.0000", "False", "Laguna"]);

const ReceivingReportColumnConfigs = [
	receivingReportColumn("Item Code", "itemCode", "text", 150, "w-[9.5rem]"),
	receivingReportColumn("Barcode", "barcode", "text", 150, "w-[9.5rem]"),
	receivingReportColumn("Description", "description", "text", 300, "w-[18.75rem]"),
	receivingReportColumn(
		"Item Category",
		"itemCategory",
		"text",
		190,
		"w-[12rem]",
	),
	receivingReportColumn("Serial No.", "serialNo", "text", 220, "w-[13.75rem]"),
	receivingReportColumn(
		"Warehouse",
		"warehouse",
		"dropdown",
		160,
		"w-[10rem]",
		dropdownOptions(WarehouseOptions),
	),
	receivingReportColumn("PO Qty", "poQty", "amount", 120, "w-[7.5rem]"),
	receivingReportColumn("RR Qty", "rrQty", "amount", 120, "w-[7.5rem]"),
	receivingReportColumn(
		"UOM",
		"uom",
		"dropdown",
		120,
		"w-[7.5rem]",
		dropdownOptions(UomOptions),
	),
	receivingReportColumn("Expiry Date", "expiryDate", "date", 150, "w-[9.5rem]"),
	receivingReportColumn(
		"Freight Cost",
		"freightCost",
		"amount",
		140,
		"w-[8.75rem]",
	),
	receivingReportColumn("Cost", "cost", "amount", 130, "w-[8rem]"),
	receivingReportColumn(
		"Gross Amount",
		"grossAmount",
		"amount",
		150,
		"w-[9.5rem]",
	),
	receivingReportColumn(
		"VAT Amount",
		"vatAmount",
		"amount",
		150,
		"w-[9.5rem]",
	),
	receivingReportColumn(
		"Discount Amount",
		"discountAmount",
		"amount",
		160,
		"w-[10rem]",
	),
	receivingReportColumn("EWT Amount", "ewtAmount", "amount", 150, "w-[9.5rem]"),
	receivingReportColumn(
		"ATC",
		"atc",
		"dropdown",
		120,
		"w-[7.5rem]",
		dropdownOptions(AtcOptions),
	),
	receivingReportColumn("Net Amount", "netAmount", "amount", 150, "w-[9.5rem]"),
	receivingReportColumn(
		"VATable",
		"vatable",
		"dropdown",
		120,
		"w-[7.5rem]",
		dropdownOptions(BooleanOptions),
	),
	receivingReportColumn(
		"VAT Inc.",
		"vatInclusive",
		"dropdown",
		120,
		"w-[7.5rem]",
		dropdownOptions(BooleanOptions),
	),
	receivingReportColumn(
		"With EWT",
		"withEwt",
		"dropdown",
		120,
		"w-[7.5rem]",
		dropdownOptions(BooleanOptions),
	),
	receivingReportColumn(
		"Res. Center",
		"responsibilityCenter",
		"dropdown",
		180,
		"w-[11.25rem]",
		dropdownOptions(ResponsibilityCenterOptions),
	),
];

const fieldClassName =
	"app-theme-field h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
