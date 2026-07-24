import { Plus } from "lucide-react";
import { CanvassFormUomOptions } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import {
	formatCanvassFormAmount,
	normalizeCanvassFormItem,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormItem } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import {
	formatMoneyNumberInput,
	MoneyNumberField,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ColumnKind = "amount" | "select" | "text";
type ColumnConfig = {
	header: string;
	id: keyof CanvassFormItem | "computedTotalCost" | "supplierQuotations";
	kind: ColumnKind;
	width: number;
	widthClassName: string;
};
type EntryUpdater = (rowId: string, updates: Partial<CanvassFormItem>) => void;

export function createCanvassFormLineColumns(
	isReadonly: boolean,
	onUpdateEntry: EntryUpdater,
): ModuleDataEntryColumn<CanvassFormItem>[] {
	return columnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<EntryCell
				column={column}
				fieldId={context.fieldId}
				fieldName={context.fieldName}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function EntryCell({
	column,
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: ColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: EntryUpdater;
	row: CanvassFormItem;
}) {
	if (column.id === "computedTotalCost") {
		return (
			<div className={displayClassName("min-h-20 justify-end tabular-nums")}>
				{formatCanvassFormAmount(normalizeCanvassFormItem(row).totalCost)}
			</div>
		);
	}

	if (column.id === "supplierQuotations") {
		return (
			<SupplierQuotationsCell
				fieldId={fieldId}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		);
	}

	const value = String(row[column.id] ?? "");

	if (column.kind === "select") {
		const options =
			column.id === "vatInclusive" || column.id === "vatExclusive"
				? ["False", "True"]
				: CanvassFormUomOptions;

		return (
			<select
				id={fieldId}
				name={fieldName}
				value={value}
				disabled={isReadonly}
				onChange={(event) =>
					onUpdateEntry(row.id, { [column.id]: event.target.value })
				}
				className={controlClassName()}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		);
	}

	if (column.kind === "amount") {
		return (
			<MoneyNumberField
				id={fieldId}
				name={fieldName}
				value={formatMoneyNumberInput(value)}
				readOnly={isReadonly}
				onValueChange={(nextValue) =>
					onUpdateEntry(row.id, {
						[column.id]: parseMoneyNumberInput(nextValue),
					})
				}
				className={controlClassName("text-right tabular-nums")}
			/>
		);
	}

	return (
		<input
			id={fieldId}
			name={fieldName}
			type="text"
			value={value}
			readOnly={isReadonly}
			onChange={(event) =>
				onUpdateEntry(row.id, { [column.id]: event.target.value })
			}
			className={controlClassName()}
		/>
	);
}

function controlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

function displayClassName(extraClassName?: string) {
	return joinClasses(
		"flex h-10 w-full items-center px-3 text-sm font-semibold text-darknavy",
		extraClassName,
	);
}

const columnConfigs = [
	column("PR No.", "prNo", "text", 150, "w-[9.5rem]"),
	column("Item Code", "itemCode", "text", 150, "w-[9.5rem]"),
	column("Barcode", "barcode", "text", 150, "w-[9.5rem]"),
	column("Description", "description", "text", 300, "w-[18.75rem]"),
	column("UOM", "uom", "select", 120, "w-[7.5rem]"),
	column("Qty", "quantity", "amount", 140, "w-[8.75rem]"),
	column("VAT Inc.", "vatInclusive", "select", 120, "w-[7.5rem]"),
	column("VAT Ex.", "vatExclusive", "select", 120, "w-[7.5rem]"),
	column("Supplier Quotations", "supplierQuotations", "text", 620, "w-[38.75rem]"),
	column("Selected Supplier", "selectedSupplier", "text", 200, "w-[12.5rem]"),
	column("Total Cost", "computedTotalCost", "amount", 150, "w-[9.5rem]"),
];

function column(
	header: string,
	id: keyof CanvassFormItem | "computedTotalCost" | "supplierQuotations",
	kind: ColumnKind,
	width: number,
	widthClassName: string,
): ColumnConfig {
	return { header, id, kind, width, widthClassName };
}

function SupplierQuotationsCell({
	fieldId,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	fieldId: string;
	isReadonly: boolean;
	onUpdateEntry: EntryUpdater;
	row: CanvassFormItem;
}) {
	const visibleSupplierCount = Math.min(
		SupplierQuotationFields.length,
		Math.max(1, Math.trunc(Number(row.supplierCount) || 1)),
	);
	const visibleSuppliers = SupplierQuotationFields.slice(0, visibleSupplierCount);
	const canAddSupplier =
		!isReadonly && visibleSupplierCount < SupplierQuotationFields.length;

	return (
		<div className="grid min-w-[38rem] gap-1.5 p-2">
			<div className="grid grid-cols-[4.5rem_minmax(7rem,0.75fr)_minmax(10rem,1fr)_minmax(7rem,0.7fr)] items-center gap-1.5 px-1 text-[11px] font-semibold text-darknavy/50">
				<span />
				<span>Code</span>
				<span>Supplier Name</span>
				<span className="text-right">Cost</span>
			</div>
			{visibleSuppliers.map((supplier) => (
				<div
					key={supplier.index}
					className="grid grid-cols-[4.5rem_minmax(7rem,0.75fr)_minmax(10rem,1fr)_minmax(7rem,0.7fr)] items-center gap-1.5"
				>
					<div className="text-xs font-semibold text-darknavy/55">
						Supplier {supplier.index}
					</div>
					<input
						id={`${fieldId}-${supplier.code}`}
						name={`${fieldId}-${supplier.code}`}
						type="text"
						value={String(row[supplier.code] ?? "")}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateEntry(row.id, { [supplier.code]: event.target.value })
						}
						className={controlClassName()}
					/>
					<input
						id={`${fieldId}-${supplier.name}`}
						name={`${fieldId}-${supplier.name}`}
						type="text"
						value={String(row[supplier.name] ?? "")}
						readOnly={isReadonly}
						onChange={(event) =>
							onUpdateEntry(row.id, { [supplier.name]: event.target.value })
						}
						className={controlClassName()}
					/>
					<MoneyNumberField
						id={`${fieldId}-${supplier.cost}`}
						name={`${fieldId}-${supplier.cost}`}
						value={formatMoneyNumberInput(String(row[supplier.cost] ?? ""))}
						readOnly={isReadonly}
						onValueChange={(nextValue) =>
							onUpdateEntry(row.id, {
								[supplier.cost]: parseMoneyNumberInput(nextValue),
							})
						}
						className={controlClassName("text-right tabular-nums")}
					/>
				</div>
			))}
			{canAddSupplier ? (
				<button
					type="button"
					onClick={() =>
						onUpdateEntry(row.id, { supplierCount: visibleSupplierCount + 1 })
					}
					className="mt-1 inline-flex h-8 w-fit justify-self-end items-center gap-1.5 rounded-md border border-skyblue/30 bg-skyblue/10 px-3 text-xs font-semibold text-skyblue transition hover:border-skyblue/50 hover:bg-skyblue/15"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Supplier
				</button>
			) : null}
		</div>
	);
}

const SupplierQuotationFields = [
	{
		index: 1,
		code: "supplierCode1",
		name: "supplierName1",
		cost: "unitCost1",
	},
	{
		index: 2,
		code: "supplierCode2",
		name: "supplierName2",
		cost: "unitCost2",
	},
	{
		index: 3,
		code: "supplierCode3",
		name: "supplierName3",
		cost: "unitCost3",
	},
	{
		index: 4,
		code: "supplierCode4",
		name: "supplierName4",
		cost: "unitCost4",
	},
] satisfies {
	index: number;
	code: keyof CanvassFormItem;
	name: keyof CanvassFormItem;
	cost: keyof CanvassFormItem;
}[];
