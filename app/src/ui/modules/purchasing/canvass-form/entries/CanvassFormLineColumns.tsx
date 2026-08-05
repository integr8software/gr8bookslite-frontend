import { Minus, Plus } from "lucide-react";
import { CanvassFormUomOptions } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import {
	formatCanvassFormAmount,
	normalizeCanvassFormItem,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormItem } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
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
	widthMode?: "auto" | "fixed";
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
		widthMode: column.widthMode,
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
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly}
				options={options.map((option) => ({ name: option, value: option }))}
				placeholder=""
				className={EntryDropdownClassName}
				onChange={(nextValue) =>
					onUpdateEntry(row.id, { [column.id]: String(nextValue) })
				}
			/>
		);
	}

	if (column.id === "selectedSupplier") {
		return (
			<SelectedSupplierCell
				fieldId={fieldId}
				fieldName={fieldName}
				isReadonly={isReadonly}
				row={row}
				onUpdateEntry={onUpdateEntry}
			/>
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
	column("MOQ", "minimumOrderQuantity", "amount", 140, "w-[8.75rem]"),
	column("Supplier Quotations", "supplierQuotations", "text", 880, "w-[55rem]", "fixed"),
	column("Selected Supplier", "selectedSupplier", "text", 300, "w-[18.75rem]"),
	column("Total Cost", "computedTotalCost", "amount", 150, "w-[9.5rem]"),
];

function column(
	header: string,
	id: keyof CanvassFormItem | "computedTotalCost" | "supplierQuotations",
	kind: ColumnKind,
	width: number,
	widthClassName: string,
	widthMode?: "auto" | "fixed",
): ColumnConfig {
	return { header, id, kind, width, widthClassName, widthMode };
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
	const visibleSuppliers = getVisibleSupplierFields(row);
	const selectedSupplierSlots = splitSelectedSupplierSlots(
		row.selectedSupplier,
		visibleSupplierCount,
	);
	const canAddSupplier =
		!isReadonly && visibleSupplierCount < SupplierQuotationFields.length;

	return (
		<div className="grid min-w-[54rem] gap-2 p-2">
			<div className="grid grid-cols-[6rem_6rem_6rem_7.5rem_minmax(11rem,1fr)_7.5rem] items-center gap-1.5 px-1 text-[11px] font-bold text-darknavy">
				<span />
				<span>VAT Inc.</span>
				<span>VAT Ex.</span>
				<span>Code</span>
				<span>Supplier Name</span>
				<span className="text-right">Cost</span>
			</div>
			{visibleSuppliers.map((supplier, supplierIndex) => (
				<div
					key={supplier.index}
					className="grid grid-cols-[6rem_6rem_6rem_7.5rem_minmax(11rem,1fr)_7.5rem] items-center gap-1.5"
				>
					<div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-darknavy/55">
						{!isReadonly && visibleSupplierCount > 1 ? (
							<button
								type="button"
								onClick={() =>
									onUpdateEntry(
										row.id,
										createRemoveSupplierUpdates(
											row,
											supplier.index,
											visibleSupplierCount,
										),
									)
								}
								className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10"
								aria-label={`Remove Supplier ${supplier.index}`}
								title={`Remove Supplier ${supplier.index}`}
							>
								<Minus className="h-3.5 w-3.5" />
							</button>
						) : null}
						<span className="min-w-0 truncate">Supplier {supplier.index}</span>
					</div>
					<MoneyNumberField
						id={`${fieldId}-${supplier.vatInclusive}`}
						name={`${fieldId}-${supplier.vatInclusive}`}
						value={formatMoneyNumberInput(String(row[supplier.vatInclusive] ?? ""))}
						readOnly={isReadonly}
						onValueChange={(nextValue) =>
							onUpdateEntry(row.id, {
								[supplier.vatInclusive]: formatMoneyNumberInput(nextValue),
							})
						}
						className={controlClassName("text-right tabular-nums")}
					/>
					<MoneyNumberField
						id={`${fieldId}-${supplier.vatExclusive}`}
						name={`${fieldId}-${supplier.vatExclusive}`}
						value={formatMoneyNumberInput(String(row[supplier.vatExclusive] ?? ""))}
						readOnly={isReadonly}
						onValueChange={(nextValue) =>
							onUpdateEntry(row.id, {
								[supplier.vatExclusive]: formatMoneyNumberInput(nextValue),
							})
						}
						className={controlClassName("text-right tabular-nums")}
					/>
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
						readOnly={isReadonly || Boolean(selectedSupplierSlots[supplierIndex])}
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
				<div className="mt-1 flex flex-wrap items-center justify-end gap-2">
				<button
					type="button"
					onClick={() =>
						onUpdateEntry(row.id, { supplierCount: visibleSupplierCount + 1 })
					}
							className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md border border-skyblue/30 bg-skyblue/10 px-3 text-xs font-semibold text-skyblue transition hover:border-skyblue/50 hover:bg-skyblue/15"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Supplier
				</button>
				</div>
			) : null}
		</div>
	);
}

function SelectedSupplierCell({
	fieldId,
	fieldName,
	isReadonly,
	onUpdateEntry,
	row,
}: {
	fieldId: string;
	fieldName: string;
	isReadonly: boolean;
	onUpdateEntry: EntryUpdater;
	row: CanvassFormItem;
}) {
	const visibleSupplierCount = getVisibleSupplierFields(row).length;
	const selectedValues = splitSelectedSupplierSlots(
		row.selectedSupplier,
		visibleSupplierCount,
	);
	const supplierOptions = getSupplierSelectionOptions(row);

	return (
		<div className="grid min-w-[18rem] gap-2 p-2">
			<div className="px-1 text-[11px] font-bold text-darknavy">
				Supplier
			</div>
			{getVisibleSupplierFields(row).map((supplier, selectedIndex) => {
				const selectedValue = selectedValues[selectedIndex] ?? "";
				const selectedOptionValue = getSupplierSelectionOptionValue(
					supplierOptions,
					selectedValue,
				);

				return (
					<AppAdvancedDropdown
						key={supplier.index}
						id={`${fieldId}-${supplier.index}`}
						name={`${fieldName}-${supplier.index}`}
						value={selectedOptionValue}
						readOnly={isReadonly}
						options={supplierOptions}
						selectionMode="single"
						placeholder="Select supplier"
						searchPlaceholder="Search supplier"
						className={EntryDropdownClassName}
						onChange={(nextValue) => {
							const nextOptionValue = Array.isArray(nextValue)
								? String(nextValue[0] ?? "")
								: String(nextValue);
							const nextSupplierName = getSupplierNameFromOptionValue(
								supplierOptions,
								nextOptionValue,
							);

							onUpdateEntry(row.id, {
								selectedSupplier: updateSelectedSupplierValue(
									selectedValues,
									selectedIndex,
									nextSupplierName,
								),
								[supplier.name]: nextSupplierName,
							});
						}}
					/>
				);
			})}
			<div className="h-8" aria-hidden="true" />
		</div>
	);
}

const SupplierQuotationFields = [
	{
		index: 1,
		code: "supplierCode1",
		name: "supplierName1",
		cost: "unitCost1",
		vatExclusive: "vatExclusive1",
		vatInclusive: "vatInclusive1",
	},
	{
		index: 2,
		code: "supplierCode2",
		name: "supplierName2",
		cost: "unitCost2",
		vatExclusive: "vatExclusive2",
		vatInclusive: "vatInclusive2",
	},
	{
		index: 3,
		code: "supplierCode3",
		name: "supplierName3",
		cost: "unitCost3",
		vatExclusive: "vatExclusive3",
		vatInclusive: "vatInclusive3",
	},
	{
		index: 4,
		code: "supplierCode4",
		name: "supplierName4",
		cost: "unitCost4",
		vatExclusive: "vatExclusive4",
		vatInclusive: "vatInclusive4",
	},
] satisfies {
	index: number;
	code: keyof CanvassFormItem;
	name: keyof CanvassFormItem;
	cost: keyof CanvassFormItem;
	vatExclusive: keyof CanvassFormItem;
	vatInclusive: keyof CanvassFormItem;
}[];

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:min-h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function getSupplierSelectionOptions(row: CanvassFormItem) {
	return SupplierQuotationFields.reduce<AppAdvancedDropdownOption[]>((options, supplier) => {
		const name = String(row[supplier.name] ?? "").trim();
		const code = String(row[supplier.code] ?? "").trim();
		const value = name || code;

		if (!value) {
			return options;
		}

		options.push({
			name: value,
			value: `${supplier.index}:${value}`,
			label: code && name && code !== name ? code : undefined,
		});

		return options;
	}, []);
}

function getSupplierSelectionOptionValue(
	options: AppAdvancedDropdownOption[],
	selectedValue: string,
) {
	return (
		options.find((option) => option.name === selectedValue)?.value ??
		(selectedValue ? `custom:${selectedValue}` : "")
	);
}

function getSupplierNameFromOptionValue(
	options: AppAdvancedDropdownOption[],
	optionValue: string,
) {
	return options.find((option) => option.value === optionValue)?.name ?? "";
}

function getVisibleSupplierFields(row: CanvassFormItem) {
	const visibleSupplierCount = Math.min(
		SupplierQuotationFields.length,
		Math.max(1, Math.trunc(Number(row.supplierCount) || 1)),
	);

	return SupplierQuotationFields.slice(0, visibleSupplierCount);
}

function updateSelectedSupplierValue(
	currentValues: string[],
	index: number,
	nextValue: string,
) {
	const nextValues = [...currentValues];
	nextValues[index] = nextValue.trim();

	return nextValues.join(", ");
}

function splitSelectedSupplierSlots(value: string, slotCount: number) {
	const values = String(value ?? "")
		.split(",")
		.map((supplier) => supplier.trim());

	while (values.length < slotCount) {
		values.push("");
	}

	return values.slice(0, slotCount);
}

function createRemoveSupplierUpdates(
	row: CanvassFormItem,
	removeIndex: number,
	visibleSupplierCount: number,
): Partial<CanvassFormItem> {
	const updates: Partial<CanvassFormItem> = {
		supplierCount: Math.max(1, visibleSupplierCount - 1),
	};
	for (let index = removeIndex; index <= SupplierQuotationFields.length; index += 1) {
		const current = SupplierQuotationFields[index - 1];
		const next = SupplierQuotationFields[index];

		updates[current.code] = next ? String(row[next.code] ?? "") : "";
		updates[current.name] = next ? String(row[next.name] ?? "") : "";
		updates[current.cost] = next ? Number(row[next.cost]) || 0 : 0;
		updates[current.vatExclusive] = next
			? formatMoneyNumberInput(String(row[next.vatExclusive] ?? ""))
			: "0.00";
		updates[current.vatInclusive] = next
			? formatMoneyNumberInput(String(row[next.vatInclusive] ?? ""))
			: "0.00";
	}

	const selectedSupplierSlots = splitSelectedSupplierSlots(
		row.selectedSupplier,
		visibleSupplierCount,
	);
	selectedSupplierSlots.splice(removeIndex - 1, 1);
	updates.selectedSupplier = selectedSupplierSlots.join(", ");

	return updates;
}
