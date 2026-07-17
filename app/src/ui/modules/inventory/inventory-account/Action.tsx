"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Boxes, Save } from "lucide-react";
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

const InventoryAccountHref = "/inventory/inventory-account";

type InventoryAccountMode = "add" | "edit" | "view";
type InventoryAccountSection = "classification" | "references";
type InventoryAccountLineField = keyof InventoryAccountLine;
type InventoryAccountColumnKind = "amount" | "text";

type InventoryAccountValues = {
	warehouse: string;
	itemType: string;
	itemCategory: string;
	itemGroup: string;
	remarks: string;
	transNo: string;
	documentDate: string;
	status: string;
	lines: InventoryAccountLine[];
};

type InventoryAccountLine = {
	id: string;
	itemCode: string;
	itemName: string;
	uom: string;
	stockOnHand: string;
	physicalCount: string;
	variance: string;
};

type InventoryAccountColumnConfig = {
	header: string;
	id: InventoryAccountLineField;
	kind: InventoryAccountColumnKind;
	width: number;
	widthClassName: string;
};

type InventoryAccountEntryUpdater = (
	rowId: string,
	field: InventoryAccountLineField,
	value: string,
) => void;

export function InventoryAccountAction() {
	const router = useRouter();
	const pathname = usePathname();
	const mode = getInventoryAccountMode(pathname);
	const isReadonly = mode === "view";
	const [activeTab, setActiveTab] =
		useState<InventoryAccountSection>("classification");
	const [values, setValues] = useState<InventoryAccountValues>(
		createInitialInventoryAccountValues,
	);
	const totals = useMemo(() => calculateInventoryAccountTotals(values.lines), [
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
		field: InventoryAccountLineField,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: current.lines.map((line) =>
				line.id === rowId ? recalculateLine({ ...line, [field]: value }) : line,
			),
		}));
	}

	function updateLines(lines: InventoryAccountLine[]) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, lines: lines.map(recalculateLine) }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		router.push(InventoryAccountHref);
	}

	return (
		<form className="grid gap-5" onSubmit={handleSubmit}>
			<InventoryAccountHeader mode={mode} isReadonly={isReadonly} />
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Inventory account sections"
				tabs={InventoryAccountTabs}
				onTabChange={setActiveTab}
			/>
			<section className="grid gap-4 rounded-md border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
				{activeTab === "classification" ? (
					<InventoryAccountClassificationSection
						isReadonly={isReadonly}
						values={values}
						onChange={handleInputChange}
					/>
				) : null}
				{activeTab === "references" ? (
					<InventoryAccountReferencesSection
						isReadonly={isReadonly}
						values={values}
						onChange={handleInputChange}
					/>
				) : null}
			</section>
			<InventoryAccountEntries
				isReadonly={isReadonly}
				rows={values.lines}
				totals={totals}
				onRowsChange={updateLines}
				onUpdateLine={updateLine}
			/>
		</form>
	);
}

function InventoryAccountHeader({
	isReadonly,
	mode,
}: {
	isReadonly: boolean;
	mode: InventoryAccountMode;
}) {
	const copy = InventoryAccountActionCopy[mode];

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
						href={InventoryAccountHref}
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

function InventoryAccountClassificationSection({
	isReadonly,
	onChange,
	values,
}: InventoryAccountSectionProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
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
					label="Item Type"
					name="itemType"
					value={values.itemType}
					disabled={isReadonly}
					options={ItemTypeOptions}
					onChange={onChange}
				/>
				<SelectField
					label="Item Category"
					name="itemCategory"
					value={values.itemCategory}
					disabled={isReadonly}
					options={ItemCategoryOptions}
					onChange={onChange}
				/>
				<SelectField
					label="Item Group"
					name="itemGroup"
					value={values.itemGroup}
					disabled={isReadonly}
					options={ItemGroupOptions}
					onChange={onChange}
				/>
			</div>
			<div className="grid content-start gap-4">
				<TextAreaField
					label="Remarks"
					name="remarks"
					value={values.remarks}
					disabled={isReadonly}
					onChange={onChange}
				/>
			</div>
		</div>
	);
}

function InventoryAccountReferencesSection({
	isReadonly,
	onChange,
	values,
}: InventoryAccountSectionProps) {
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

function InventoryAccountEntries({
	isReadonly,
	onRowsChange,
	onUpdateLine,
	rows,
	totals,
}: {
	isReadonly: boolean;
	onRowsChange: (rows: InventoryAccountLine[]) => void;
	onUpdateLine: InventoryAccountEntryUpdater;
	rows: InventoryAccountLine[];
	totals: InventoryAccountTotals;
}) {
	const updateEntry = useCallback(
		(rowId: string, field: InventoryAccountLineField, value: string) => {
			onUpdateLine(rowId, field, value);
		},
		[onUpdateLine],
	);
	const columns = useMemo<ModuleDataEntryColumn<InventoryAccountLine>[]>(
		() => createInventoryAccountColumns(isReadonly, updateEntry),
		[isReadonly, updateEntry],
	);
	const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
		() =>
			columns.map((column) => ({
				id: column.id,
				isHideable: !["itemCode", "itemName", "physicalCount"].includes(
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
		onRowsChange([
			...rows,
			...Array.from({ length: count }, () => createInventoryAccountLine()),
		]);
	}

	function clearRows(action: ModuleDataEntryClearAction) {
		if (action === "all") {
			onRowsChange([createInventoryAccountLine()]);
			return;
		}

		const nextRows = rows.filter(
			(row) => !shouldClearInventoryAccountEntry(row, action),
		);
		onRowsChange(nextRows.length > 0 ? nextRows : [createInventoryAccountLine()]);
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
			id: createInventoryAccountLine().id,
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
			createInventoryAccountLine(),
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
		onRowsChange(nextRows.length > 0 ? nextRows : [createInventoryAccountLine()]);
	}

	return (
		<ModuleDataEntry
			columns={columns}
			columnOptions={columnOptions}
			description="Compare stock on hand against physical count and review item variances."
			emptyRowLabel="count line"
			exportOptions={[
				{ id: "csv", label: "CSV", onSelect: () => undefined },
				{ id: "excel", label: "Excel", onSelect: () => undefined },
				{ id: "pdf", label: "PDF", onSelect: () => undefined },
			]}
			footerDetails={
				<div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
					<span>Stock On Hand: {formatAmount(totals.stockOnHand)}</span>
					<span>Physical Count: {formatAmount(totals.physicalCount)}</span>
					<span>Variance: {formatAmount(totals.variance)}</span>
				</div>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				physicalCount: formatAmount(totals.physicalCount),
				stockOnHand: formatAmount(totals.stockOnHand),
				variance: formatAmount(totals.variance),
			}}
			title="Inventory Count Details"
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

function createInventoryAccountColumns(
	isReadonly: boolean,
	onUpdateEntry: InventoryAccountEntryUpdater,
): ModuleDataEntryColumn<InventoryAccountLine>[] {
	return InventoryAccountColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<InventoryAccountEntryCell
				column={column}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function InventoryAccountEntryCell({
	column,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: InventoryAccountColumnConfig;
	isReadonly: boolean;
	onUpdateEntry: InventoryAccountEntryUpdater;
	row: InventoryAccountLine;
}) {
	const value = row[column.id];

	if (column.kind === "amount") {
		return (
			<EntryAmountInput
				value={value}
				readOnly={isReadonly || column.id === "variance"}
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

type InventoryAccountSectionProps = {
	isReadonly: boolean;
	onChange: (
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => void;
	values: InventoryAccountValues;
};

type FieldProps = {
	disabled: boolean;
	label: string;
	name: string;
	onChange: InventoryAccountSectionProps["onChange"];
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

type InventoryAccountTotals = {
	physicalCount: number;
	stockOnHand: number;
	variance: number;
};

function calculateInventoryAccountTotals(
	lines: InventoryAccountLine[],
): InventoryAccountTotals {
	return lines.reduce(
		(totals, line) => ({
			physicalCount:
				totals.physicalCount + parseMoneyNumberInput(line.physicalCount),
			stockOnHand: totals.stockOnHand + parseMoneyNumberInput(line.stockOnHand),
			variance: totals.variance + parseMoneyNumberInput(line.variance),
		}),
		{
			physicalCount: 0,
			stockOnHand: 0,
			variance: 0,
		},
	);
}

function createInitialInventoryAccountValues(): InventoryAccountValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		warehouse: "--Select Warehouse--",
		itemType: "--Select Item Type--",
		itemCategory: "--Select Item Category--",
		itemGroup: "--Select Item Group--",
		remarks: "",
		transNo: "",
		documentDate: today,
		status: "Draft",
		lines: [createInventoryAccountLine()],
	};
}

function createInventoryAccountLine(): InventoryAccountLine {
	return {
		id: `ia-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		itemName: "",
		uom: "",
		stockOnHand: "0.00",
		physicalCount: "0.00",
		variance: "0.00",
	};
}

function recalculateLine(line: InventoryAccountLine): InventoryAccountLine {
	const variance =
		parseMoneyNumberInput(line.physicalCount) -
		parseMoneyNumberInput(line.stockOnHand);

	return {
		...line,
		variance: variance.toFixed(2),
	};
}

function inventoryAccountColumn(
	header: string,
	id: InventoryAccountLineField,
	kind: InventoryAccountColumnKind,
	width: number,
	widthClassName: string,
): InventoryAccountColumnConfig {
	return {
		header,
		id,
		kind,
		width,
		widthClassName,
	};
}

function inventoryAccountEntryHasData(entry: InventoryAccountLine) {
	return (
		entry.itemCode.trim().length > 0 ||
		entry.itemName.trim().length > 0 ||
		entry.uom.trim().length > 0 ||
		parseMoneyNumberInput(entry.stockOnHand) > 0 ||
		parseMoneyNumberInput(entry.physicalCount) > 0
	);
}

function inventoryAccountEntryIsComplete(entry: InventoryAccountLine) {
	return (
		entry.itemCode.trim().length > 0 &&
		entry.itemName.trim().length > 0 &&
		entry.uom.trim().length > 0
	);
}

function shouldClearInventoryAccountEntry(
	entry: InventoryAccountLine,
	action: Exclude<ModuleDataEntryClearAction, "all">,
) {
	if (action === "with-data") {
		return inventoryAccountEntryHasData(entry);
	}

	if (action === "incomplete") {
		return inventoryAccountEntryHasData(entry) && !inventoryAccountEntryIsComplete(entry);
	}

	return !inventoryAccountEntryHasData(entry);
}

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

function formatAmount(value: number) {
	return new Intl.NumberFormat("en-PH", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

function getInventoryAccountMode(pathname: string): InventoryAccountMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

const InventoryAccountTabs = [
	{ id: "classification", label: "Warehouse / Item Filters" },
	{ id: "references", label: "References / Status" },
] satisfies ModuleTabItem<InventoryAccountSection>[];

const InventoryAccountActionCopy = {
	add: {
		title: "Add Inventory Account",
		description:
			"Select warehouse and item filters, then record physical counts against stock on hand.",
	},
	edit: {
		title: "Edit Inventory Account",
		description:
			"Update warehouse filters, count references, and inventory count variance lines.",
	},
	view: {
		title: "View Inventory Account",
		description:
			"Review warehouse filters, count references, stock on hand, physical count, and variance.",
	},
} satisfies Record<InventoryAccountMode, { description: string; title: string }>;

const WarehouseOptions = [
	"--Select Warehouse--",
	"Laguna",
	"Manila",
	"Cebu",
	"Davao",
] as const;
const ItemTypeOptions = [
	"--Select Item Type--",
	"Inventory",
	"Non-Inventory",
	"Service",
] as const;
const ItemCategoryOptions = [
	"--Select Item Category--",
	"Raw Materials",
	"Finished Goods",
	"Supplies",
] as const;
const ItemGroupOptions = [
	"--Select Item Group--",
	"Construction",
	"Electrical",
	"General",
] as const;
const StatusOptions = ["Draft", "Open", "Approved", "Closed", "Cancelled"] as const;

const InventoryAccountColumnConfigs = [
	inventoryAccountColumn("Item Code", "itemCode", "text", 160, "w-[10rem]"),
	inventoryAccountColumn("Item Name", "itemName", "text", 260, "w-[16rem]"),
	inventoryAccountColumn("UOM", "uom", "text", 120, "w-[7.5rem]"),
	inventoryAccountColumn(
		"Stock On Hand",
		"stockOnHand",
		"amount",
		170,
		"w-[10.5rem]",
	),
	inventoryAccountColumn(
		"Physical Count",
		"physicalCount",
		"amount",
		170,
		"w-[10.5rem]",
	),
	inventoryAccountColumn("Variance", "variance", "amount", 160, "w-[10rem]"),
];

const fieldClassName =
	"app-theme-field h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";
