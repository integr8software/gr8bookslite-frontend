import { PurchaseRequestUomOptions } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type { PurchaseRequestItem } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
	formatMoneyNumberInput,
	MoneyNumberField,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type PurchaseRequestLineColumnKind = "amount" | "select" | "text";

type PurchaseRequestLineColumnConfig = {
	header: string;
	id: keyof PurchaseRequestItem;
	kind: PurchaseRequestLineColumnKind;
	width: number;
	widthClassName: string;
};

type PurchaseRequestLineUpdater = (
	rowId: string,
	updates: Partial<PurchaseRequestItem>,
) => void;

export function createPurchaseRequestLineColumns(
	isReadonly: boolean,
	onUpdateEntry: PurchaseRequestLineUpdater,
): ModuleDataEntryColumn<PurchaseRequestItem>[] {
	return PurchaseRequestLineColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<PurchaseRequestLineCell
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

function PurchaseRequestLineCell({
	column,
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: PurchaseRequestLineColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: PurchaseRequestLineUpdater;
	row: PurchaseRequestItem;
}) {
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
				{PurchaseRequestUomOptions.map((option) => (
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
				className={entryCellControlClassName("text-right tabular-nums")}
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

const PurchaseRequestLineColumnConfigs = [
	column("Item Code", "itemCode", "text", 150, "w-[9.5rem]"),
	column("Barcode", "barcode", "text", 150, "w-[9.5rem]"),
	column("Description", "description", "text", 300, "w-[18.75rem]"),
	column("UOM", "uom", "select", 120, "w-[7.5rem]"),
	column("Qty", "quantity", "amount", 150, "w-[9.5rem]"),
	column("LotNo", "lotNo", "text", 120, "w-[7.5rem]"),
	column("Cost", "cost", "amount", 160, "w-[10rem]"),
	column("Res. Center", "responsibilityCenter", "text", 190, "w-[12rem]"),
];

function column(
	header: string,
	id: keyof PurchaseRequestItem,
	kind: PurchaseRequestLineColumnKind,
	width: number,
	widthClassName: string,
): PurchaseRequestLineColumnConfig {
	return { header, id, kind, width, widthClassName };
}
