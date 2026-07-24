import {
	PurchaseOrderBooleanOptions,
	PurchaseOrderUomOptions,
} from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import {
	formatPurchaseOrderAmount,
	getPurchaseOrderItemGrossAmount,
	getPurchaseOrderItemNetAmount,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { PurchaseOrderItem } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type PurchaseOrderLineColumnKind = "amount" | "date" | "select" | "text";

type PurchaseOrderLineColumnConfig = {
	header: string;
	id: keyof PurchaseOrderItem | "grossAmount" | "netAmount";
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

	if (column.id === "netAmount") {
		return (
			<div className={entryCellDisplayClassName("justify-end tabular-nums")}>
				{formatPurchaseOrderAmount(getPurchaseOrderItemNetAmount(row))}
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
				className={entryCellControlClassName()}
			>
				{(column.options ?? []).map((option) => (
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
	column("Item Code", "itemCode", "text", 110, "w-[7rem]"),
	column("Barcode", "barcode", "text", 110, "w-[7rem]"),
	column("Item", "itemName", "text", 170, "w-[10.5rem]"),
	column("Category", "itemCategory", "text", 150, "w-[9.5rem]"),
	column("Qty", "quantity", "amount", 95, "w-[6rem]"),
	column("UOM", "uom", "select", 105, "w-[6.5rem]", PurchaseOrderUomOptions),
	column("Rate Delivery", "rateDelivery", "amount", 125, "w-[7.75rem]"),
	column("Freight", "freightCost", "amount", 110, "w-[7rem]"),
	column("Cost", "cost", "amount", 110, "w-[7rem]"),
	column("Gross", "grossAmount", "amount", 125, "w-[7.75rem]"),
	column("Disc", "discountAmount", "amount", 110, "w-[7rem]"),
	column("Net", "netAmount", "amount", 125, "w-[7.75rem]"),
	column("VATable", "vatable", "select", 105, "w-[6.5rem]", PurchaseOrderBooleanOptions),
	column("VAT Inc.", "vatInclusive", "select", 105, "w-[6.5rem]", PurchaseOrderBooleanOptions),
	column("VAT X", "vatType", "text", 120, "w-[7.5rem]"),
	column("EWT", "ewt", "text", 120, "w-[7.5rem]"),
	column("Res. Center", "responsibilityCenter", "text", 170, "w-[10.5rem]"),
	column("Budget Code", "budgetCode", "text", 180, "w-[11.25rem]"),
	column("PRQ Qty", "prQuantity", "amount", 105, "w-[6.5rem]"),
];

function column(
	header: string,
	id: keyof PurchaseOrderItem | "grossAmount" | "netAmount",
	kind: PurchaseOrderLineColumnKind,
	width: number,
	widthClassName: string,
	options?: readonly string[],
): PurchaseOrderLineColumnConfig {
	return { header, id, kind, options, width, widthClassName };
}
