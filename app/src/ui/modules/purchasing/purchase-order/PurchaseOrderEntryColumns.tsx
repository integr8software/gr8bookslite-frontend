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

type PurchaseOrderEntryColumnKind = "amount" | "date" | "select" | "text";

type PurchaseOrderEntryColumnConfig = {
	header: string;
	id: keyof PurchaseOrderItem | "grossAmount" | "netAmount";
	kind: PurchaseOrderEntryColumnKind;
	options?: readonly string[];
	width: number;
	widthClassName: string;
};

type PurchaseOrderEntryUpdater = (
	rowId: string,
	updates: Partial<PurchaseOrderItem>,
) => void;

export function createPurchaseOrderEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: PurchaseOrderEntryUpdater,
): ModuleDataEntryColumn<PurchaseOrderItem>[] {
	return PurchaseOrderEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<PurchaseOrderEntryCell
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

function PurchaseOrderEntryCell({
	column,
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: PurchaseOrderEntryColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: PurchaseOrderEntryUpdater;
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

const PurchaseOrderEntryColumnConfigs = [
	column("Item Code", "itemCode", "text", 130, "w-[8rem]"),
	column("Barcode", "barcode", "text", 130, "w-[8rem]"),
	column("Item Name", "itemName", "text", 180, "w-[11.25rem]"),
	column("Item Category", "itemCategory", "text", 180, "w-[11.25rem]"),
	column("Qty", "quantity", "amount", 120, "w-[7.5rem]"),
	column("UOM", "uom", "select", 130, "w-[8rem]", PurchaseOrderUomOptions),
	column("DateExpiry Date", "expiryDate", "date", 150, "w-[9.5rem]"),
	column("Freight Cost", "freightCost", "amount", 140, "w-[8.75rem]"),
	column("Cost", "cost", "amount", 130, "w-[8rem]"),
	column("Gross Amount", "grossAmount", "amount", 150, "w-[9.5rem]"),
	column("VAT Amount", "vatAmount", "amount", 140, "w-[8.75rem]"),
	column("EWT", "ewt", "text", 160, "w-[10rem]"),
	column("Discount Amount", "discountAmount", "amount", 150, "w-[9.5rem]"),
	column("Net Amount", "netAmount", "amount", 150, "w-[9.5rem]"),
	column("VATable", "vatable", "select", 120, "w-[7.5rem]", PurchaseOrderBooleanOptions),
	column("VAT Inc.", "vatInclusive", "select", 120, "w-[7.5rem]", PurchaseOrderBooleanOptions),
	column("VAT Type", "vatType", "text", 170, "w-[10.5rem]"),
	column("Res. Center", "responsibilityCenter", "text", 190, "w-[12rem]"),
	column("Budget Code", "budgetCode", "text", 220, "w-[13.75rem]"),
	column("PRQ qty", "prQuantity", "amount", 120, "w-[7.5rem]"),
];

function column(
	header: string,
	id: keyof PurchaseOrderItem | "grossAmount" | "netAmount",
	kind: PurchaseOrderEntryColumnKind,
	width: number,
	widthClassName: string,
	options?: readonly string[],
): PurchaseOrderEntryColumnConfig {
	return { header, id, kind, options, width, widthClassName };
}
