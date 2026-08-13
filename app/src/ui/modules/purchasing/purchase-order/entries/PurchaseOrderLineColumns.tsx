import { PurchaseOrderUomOptions } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import {
	formatPurchaseOrderAmount,
	getPurchaseOrderItemGrossAmount,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { PurchaseOrderItem } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	MoneyNumberField,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type PurchaseOrderLineColumnKind = "amount" | "date" | "select" | "text";
const AmountColumnKind = "amount";
const SelectColumnKind = "select";
const TextColumnKind = "text";

type PurchaseOrderLineColumnConfig = {
	header: string;
	id: keyof PurchaseOrderItem | "grossAmount" | "netOfVatAmount";
	kind: PurchaseOrderLineColumnKind;
	options?: readonly string[];
	width: number;
	widthClassName: string;
};

type PurchaseOrderLineUpdater = (
	rowId: string,
	updates: Partial<PurchaseOrderItem>,
) => void;

export function createPurchaseOrderLineColumns(
	isReadonly: boolean,
	onUpdateEntry: PurchaseOrderLineUpdater,
): ModuleDataEntryColumn<PurchaseOrderItem>[] {
	return PurchaseOrderLineColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<PurchaseOrderLineCell
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

function PurchaseOrderLineCell({
	column,
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: PurchaseOrderLineColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: PurchaseOrderLineUpdater;
	row: PurchaseOrderItem;
}) {
	if (column.id === "grossAmount") {
		return (
			<div className={entryCellDisplayClassName("justify-end tabular-nums")}>
				{formatPurchaseOrderAmount(getPurchaseOrderItemGrossAmount(row))}
			</div>
		);
	}

	if (column.id === "netOfVatAmount") {
		return (
			<div className={entryCellDisplayClassName("justify-end tabular-nums")}>
				{formatPurchaseOrderAmount(getPurchaseOrderItemNetOfVatAmount(row))}
			</div>
		);
	}

	const value = String(row[column.id] ?? "");

	if (column.kind === "select") {
		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly}
				options={(column.options ?? []).map((option) => ({
					name: option,
					value: option,
				}))}
				placeholder=""
				className={EntryDropdownClassName}
				onChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: String(nextValue) })
				}
			/>
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
					onUpdateEntry(row.id, { [column.id]: parseMoneyNumberInput(nextValue) })
				}
				className={entryCellControlClassName("text-right tabular-nums")}
			/>
		);
	}

	return (
		<input
			id={fieldId}
			name={fieldName}
			type={column.kind === "date" ? "date" : "text"}
			value={value}
			readOnly={isReadonly}
			onChange={(event) =>
				onUpdateEntry(row.id, { [column.id]: event.target.value })
			}
			className={entryCellControlClassName()}
		/>
	);
}

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

function entryCellDisplayClassName(extraClassName?: string) {
	return joinClasses(
		"flex h-10 w-full items-center px-3 text-sm font-semibold text-darknavy",
		extraClassName,
	);
}

const PurchaseOrderLineColumnConfigs = [
	column("Item Code *", "itemCode", TextColumnKind, 120, "w-[7.5rem]"),
	column("Barcode", "barcode", TextColumnKind, 115, "w-[7.25rem]"),
	column("Item Name *", "itemName", TextColumnKind, 220, "w-[13.75rem]"),
	column("PR Qty", "prQuantity", AmountColumnKind, 100, "w-[6.25rem]"),
	column("PO Qty", "quantity", AmountColumnKind, 100, "w-[6.25rem]"),
	column("UOM *", "uom", SelectColumnKind, 105, "w-[6.5rem]", PurchaseOrderUomOptions),
	column("Color", "color", TextColumnKind, 90, "w-[5.75rem]"),
	column("Brand", "brand", TextColumnKind, 100, "w-[6.25rem]"),
	column("Size", "size", TextColumnKind, 90, "w-[5.75rem]"),
	column("Model", "model", TextColumnKind, 110, "w-[7rem]"),
	column("UC *", "cost", AmountColumnKind, 110, "w-[7rem]"),
	column("Total Cost (Net of VAT)", "netOfVatAmount", AmountColumnKind, 150, "w-[9.5rem]"),
	column("VAT Amt", "vatAmount", AmountColumnKind, 125, "w-[7.75rem]"),
	column("Total Cost (Gross of VAT)", "grossAmount", AmountColumnKind, 160, "w-[10rem]"),
	column("PR No", "linePrNo", TextColumnKind, 130, "w-[8.25rem]"),
	column("Canvass No", "canvassNo", TextColumnKind, 140, "w-[8.75rem]"),
];

function getPurchaseOrderItemNetOfVatAmount(item: PurchaseOrderItem) {
	return Math.max(
		getPurchaseOrderItemGrossAmount(item) - (Number(item.vatAmount) || 0),
		0,
	);
}

function column(
	header: string,
	id: keyof PurchaseOrderItem | "grossAmount" | "netOfVatAmount",
	kind: PurchaseOrderLineColumnKind,
	width: number,
	widthClassName: string,
	options?: readonly string[],
): PurchaseOrderLineColumnConfig {
	return { header, id, kind, options, width, widthClassName };
}
