import { CanvassFormUomOptions } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import {
	formatCanvassFormAmount,
	normalizeCanvassFormItem,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormItem } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ColumnKind = "amount" | "select" | "text";
type ColumnConfig = {
	header: string;
	id: keyof CanvassFormItem | "computedTotalCost";
	kind: ColumnKind;
	width: number;
	widthClassName: string;
};
type EntryUpdater = (rowId: string, updates: Partial<CanvassFormItem>) => void;

export function createCanvassFormEntryColumns(
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
			<div className={displayClassName("justify-end tabular-nums")}>
				{formatCanvassFormAmount(normalizeCanvassFormItem(row).totalCost)}
			</div>
		);
	}

	const value = String(row[column.id] ?? "");

	if (column.kind === "select") {
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
				{CanvassFormUomOptions.map((option) => (
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
				value={value}
				readOnly={isReadonly}
				onValueChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: Number(nextValue) })
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
	column("Item Code", "itemCode", "text", 150, "w-[9.5rem]"),
	column("Barcode", "barcode", "text", 150, "w-[9.5rem]"),
	column("Description", "description", "text", 300, "w-[18.75rem]"),
	column("UOM", "uom", "select", 120, "w-[7.5rem]"),
	column("Qty", "quantity", "amount", 140, "w-[8.75rem]"),
	column("Res. Center", "responsibilityCenter", "text", 200, "w-[12.5rem]"),
	column("Supplier Code(1)", "supplierCode1", "text", 130, "w-[8rem]"),
	column("Supplier Name(1)", "supplierName1", "text", 200, "w-[12.5rem]"),
	column("Unit Cost(1)", "unitCost1", "amount", 150, "w-[9.5rem]"),
	column("Supplier Code(2)", "supplierCode2", "text", 130, "w-[8rem]"),
	column("Supplier Name(2)", "supplierName2", "text", 200, "w-[12.5rem]"),
	column("Unit Cost(2)", "unitCost2", "amount", 150, "w-[9.5rem]"),
	column("Supplier Code(3)", "supplierCode3", "text", 130, "w-[8rem]"),
	column("Supplier Name(3)", "supplierName3", "text", 200, "w-[12.5rem]"),
	column("Unit Cost(3)", "unitCost3", "amount", 150, "w-[9.5rem]"),
	column("Supplier Code(4)", "supplierCode4", "text", 130, "w-[8rem]"),
	column("Supplier Name(4)", "supplierName4", "text", 200, "w-[12.5rem]"),
	column("Unit Cost(4)", "unitCost4", "amount", 150, "w-[9.5rem]"),
	column("Selected Supplier", "selectedSupplier", "text", 200, "w-[12.5rem]"),
	column("Total Cost", "computedTotalCost", "amount", 150, "w-[9.5rem]"),
];

function column(
	header: string,
	id: keyof CanvassFormItem | "computedTotalCost",
	kind: ColumnKind,
	width: number,
	widthClassName: string,
): ColumnConfig {
	return { header, id, kind, width, widthClassName };
}
