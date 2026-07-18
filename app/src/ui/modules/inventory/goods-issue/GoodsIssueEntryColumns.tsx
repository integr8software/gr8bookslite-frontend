import {
	GoodsIssueResponsibilityCenterOptions,
	GoodsIssueUomOptions,
} from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import type { GoodsIssueLineEntry } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type GoodsIssueEntryColumnKind = "amount" | "dropdown" | "text";

type GoodsIssueEntryColumnConfig = {
	header: string;
	id: keyof GoodsIssueLineEntry;
	kind: GoodsIssueEntryColumnKind;
	options?: AppAdvancedDropdownOption[];
	width: number;
	widthClassName: string;
};

type GoodsIssueEntryUpdater = (
	rowId: string,
	updates: Partial<GoodsIssueLineEntry>,
) => void;

export function createGoodsIssueEntryColumns(
	isReadonly: boolean,
	onUpdateEntry: GoodsIssueEntryUpdater,
): ModuleDataEntryColumn<GoodsIssueLineEntry>[] {
	return GoodsIssueEntryColumnConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<GoodsIssueEntryCell
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

function GoodsIssueEntryCell({
	column,
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	column: GoodsIssueEntryColumnConfig;
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: GoodsIssueEntryUpdater;
	row: GoodsIssueLineEntry;
}) {
	const value = String(row[column.id]);

	if (column.kind === "dropdown") {
		return (
			<EntryDropdown
				id={fieldId}
				name={fieldName}
				options={column.options ?? []}
				readOnly={isReadonly}
				value={value}
				onChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: nextValue })
				}
			/>
		);
	}

	if (column.kind === "amount") {
		return (
			<EntryAmountInput
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly}
				onValueChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: nextValue })
				}
			/>
		);
	}

	return (
		<EntryInput
			id={fieldId}
			name={fieldName}
			value={value}
			readOnly={isReadonly}
			onChange={(nextValue) => onUpdateEntry(row.id, { [column.id]: nextValue })}
		/>
	);
}

function EntryDropdown({
	id,
	name,
	onChange,
	options,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onChange: (value: string) => void;
	options: AppAdvancedDropdownOption[];
	readOnly: boolean;
	value: string;
}) {
	return (
		<AppAdvancedDropdown
			id={id}
			name={name}
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
	id,
	name,
	onChange,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<input
			id={id}
			name={name}
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={entryCellControlClassName()}
		/>
	);
}

function EntryAmountInput({
	id,
	name,
	onValueChange,
	readOnly,
	value,
}: {
	id: string;
	name: string;
	onValueChange: (value: string) => void;
	readOnly: boolean;
	value: string;
}) {
	return (
		<MoneyNumberField
			id={id}
			name={name}
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

const GoodsIssueEntryColumnConfigs = [
	column("Item Code", "itemCode", "text", 130, "w-[8rem]"),
	column("Barcode", "barcode", "text", 130, "w-[8rem]"),
	column("Description", "description", "text", 260, "w-[16rem]"),
	column("Item Category", "itemCategory", "text", 180, "w-[11.25rem]"),
	column("UOM", "uom", "dropdown", 130, "w-[8rem]", GoodsIssueUomOptions),
	column("LotNo", "lotNo", "text", 120, "w-[7.5rem]"),
	column("Stock QTY", "stockQuantity", "amount", 130, "w-[8rem]"),
	column("Issue QTY", "issueQuantity", "amount", 130, "w-[8rem]"),
	column("Unit Cost", "unitCost", "amount", 130, "w-[8rem]"),
	column("Amount", "amount", "amount", 130, "w-[8rem]"),
	column("Ref No.", "referenceNo", "text", 150, "w-[9.5rem]"),
	column(
		"Res. Center",
		"responsibilityCenter",
		"dropdown",
		210,
		"w-[13rem]",
		GoodsIssueResponsibilityCenterOptions,
	),
];

function column(
	header: string,
	id: keyof GoodsIssueLineEntry,
	kind: GoodsIssueEntryColumnKind,
	width: number,
	widthClassName: string,
	options?: AppAdvancedDropdownOption[],
): GoodsIssueEntryColumnConfig {
	return { header, id, kind, options, width, widthClassName };
}

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
