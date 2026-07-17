import {
	GoodsReceiptResponsibilityCenterOptions,
	GoodsReceiptUomOptions,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type { GoodsReceiptLineEntry } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type GoodsReceiptEntryColumnKind = "amount" | "dropdown" | "text";

type GoodsReceiptEntryColumnConfig = {
	header: string;
	id: keyof GoodsReceiptLineEntry;
	kind: GoodsReceiptEntryColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type GoodsReceiptEntryUpdater = (
	rowId: string,
	updates: Partial<GoodsReceiptLineEntry>,
) => void;

export function createGoodsReceiptEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: GoodsReceiptEntryUpdater,
): ModuleDataEntryColumn<GoodsReceiptLineEntry>[] {
	return GoodsReceiptEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row) => (
			<GoodsReceiptEntryCell
				column={column}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function GoodsReceiptEntryCell({
	column,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: GoodsReceiptEntryColumnConfig;
	isReadonly: boolean;
	onUpdateEntry: GoodsReceiptEntryUpdater;
	row: GoodsReceiptLineEntry;
}) {
	const value = String(row[column.id]);

	if (column.kind === "dropdown") {
		return (
			<AppAdvancedDropdown
				className={EntryDropdownClassName}
				value={value}
				options={column.options ?? []}
				placeholder=""
				readOnly={isReadonly}
				onChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: String(nextValue) })
				}
			/>
		);
	}

	if (column.kind === "amount") {
		return (
			<MoneyNumberField
				value={value}
				readOnly={isReadonly}
				onValueChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: nextValue })
				}
				className={entryCellControlClassName("text-right tabular-nums")}
			/>
		);
	}

	return (
		<input
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

const GoodsReceiptEntryColumnConfigs = [
	column("Item Code", "itemCode", "text", 130, "w-[8rem]"),
	column("Barcode", "barcode", "text", 130, "w-[8rem]"),
	column("Item Name", "itemName", "text", 260, "w-[16rem]"),
	column("Item Category", "itemCategory", "text", 210, "w-[13rem]"),
	column("UOM", "uom", "dropdown", 130, "w-[8rem]", GoodsReceiptUomOptions),
	column("LotNo", "lotNo", "text", 120, "w-[7.5rem]"),
	column("Stock QTY", "stockQuantity", "amount", 130, "w-[8rem]"),
	column("Received QTY", "receivedQuantity", "amount", 140, "w-[8.75rem]"),
	column("Unit Cost", "unitCost", "amount", 130, "w-[8rem]"),
	column("Amount", "amount", "amount", 130, "w-[8rem]"),
	column("Ref No.", "referenceNo", "text", 150, "w-[9.5rem]"),
	column(
		"Res. Center",
		"responsibilityCenter",
		"dropdown",
		210,
		"w-[13rem]",
		GoodsReceiptResponsibilityCenterOptions,
	),
];

function column(
	header: string,
	id: keyof GoodsReceiptLineEntry,
	kind: GoodsReceiptEntryColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): GoodsReceiptEntryColumnConfig {
	return { header, id, kind, options, width, widthClassName };
}

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
