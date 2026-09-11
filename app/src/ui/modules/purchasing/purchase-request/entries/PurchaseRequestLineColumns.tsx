import { PurchaseRequestUomOptions } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type { PurchaseRequestItem } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { ItemRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import type { ServiceMaintenanceOptionResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	formatMoneyNumberInput,
	MoneyNumberField,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type PurchaseRequestLineColumnKind = "amount" | "select" | "text";
const AmountColumnKind = "amount";
const SelectColumnKind = "select";
const TextColumnKind = "text";

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
	purchaseType?: string,
	serviceDescriptionOptions: ServiceMaintenanceOptionResponseDto[] = [],
	itemDescriptionOptions: ItemRecord[] = [],
	responsibilityCenters: ResponsibilityCenter[] = [],
): ModuleDataEntryColumn<PurchaseRequestItem>[] {
	const normalizedPurchaseType = (purchaseType ?? "").toLowerCase();
	const hasGoods = normalizedPurchaseType.includes("goods");
	const hasServices = normalizedPurchaseType.includes("services");
	const hasAssets = normalizedPurchaseType.includes("assets");

	const isServices = hasServices && !hasGoods && !hasAssets;
	const isGoodsAndServices =
		(hasGoods && hasServices) || normalizedPurchaseType.includes("&");
	const usesItemMaintenance =
		["goods", "assets"].includes(normalizedPurchaseType) ||
		hasGoods ||
		hasAssets ||
		isGoodsAndServices;
	const activeConfigs = PurchaseRequestLineColumnConfigs;

	return activeConfigs.map((column) => ({
		header: column.header,
		id: column.id,
		width: column.width,
		widthClassName: column.widthClassName,
		renderCell: (row, _index, context) => (
			<PurchaseRequestLineCell
				column={column}
				fieldId={context.fieldId}
				fieldName={context.fieldName}
				usesItemMaintenance={usesItemMaintenance}
				isServices={isServices}
				isGoodsAndServices={isGoodsAndServices}
				isReadonly={isReadonly}
				itemDescriptionOptions={itemDescriptionOptions}
				responsibilityCenters={responsibilityCenters}
				row={row}
				serviceDescriptionOptions={serviceDescriptionOptions}
				onUpdateEntry={onUpdateEntry}
			/>
		),
	}));
}

function PurchaseRequestLineCell({
	column,
	fieldId,
	fieldName,
	usesItemMaintenance,
	isServices,
	isGoodsAndServices,
	isReadonly,
	itemDescriptionOptions,
	responsibilityCenters,
	onUpdateEntry,
	row,
	serviceDescriptionOptions,
}: {
	column: PurchaseRequestLineColumnConfig;
	fieldId: string;
	fieldName: string;
	usesItemMaintenance: boolean;
	isServices: boolean;
	isGoodsAndServices: boolean;
	isReadonly: boolean;
	itemDescriptionOptions: ItemRecord[];
	responsibilityCenters: ResponsibilityCenter[];
	onUpdateEntry: PurchaseRequestLineUpdater;
	row: PurchaseRequestItem;
	serviceDescriptionOptions: ServiceMaintenanceOptionResponseDto[];
}) {
	const value = String(row[column.id] ?? "");
	const isServiceRow =
		Boolean(row.serviceMaintenanceId) || (isServices && !row.itemId);

	if (isGoodsAndServices && column.id === "description") {
		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly}
				options={createCombinedDescriptionDropdownOptions(
					itemDescriptionOptions,
					serviceDescriptionOptions,
					value,
				)}
				placeholder=""
				className={EntryDropdownClassName}
				onChange={(nextValue) =>
					onUpdateEntry(
						row.id,
						getPurchaseRequestCombinedUpdates(
							itemDescriptionOptions,
							serviceDescriptionOptions,
							String(nextValue),
						),
					)
				}
			/>
		);
	}

	if (usesItemMaintenance && column.id === "description") {
		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly}
				options={createItemDescriptionDropdownOptions(itemDescriptionOptions, value)}
				placeholder=""
				className={EntryDropdownClassName}
				onChange={(nextValue) =>
					onUpdateEntry(
						row.id,
						getPurchaseRequestItemAutoFillUpdates(itemDescriptionOptions, String(nextValue)),
					)
				}
			/>
		);
	}

	if (isServices && column.id === "description") {
		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly}
				options={createServiceDescriptionDropdownOptions(serviceDescriptionOptions, value)}
				placeholder=""
				className={EntryDropdownClassName}
				onChange={(nextValue) =>
					onUpdateEntry(
						row.id,
						getPurchaseRequestServiceUpdates(
							serviceDescriptionOptions,
							String(nextValue),
						),
					)
				}
			/>
		);
	}

	if (isServiceRow && ["itemCode", "barcode", "uom", "lotNo"].includes(column.id)) {
		return (
			<input
				id={fieldId}
				name={fieldName}
				type="text"
				value="-"
				disabled
				readOnly
				tabIndex={-1}
				className={entryCellControlClassName(
					"bg-offwhite/45 text-center text-darknavy/35 cursor-not-allowed select-none",
				)}
			/>
		);
	}

	if (["itemCode", "barcode", "uom"].includes(column.id)) {
		return (
			<input
				id={fieldId}
				name={fieldName}
				type="text"
				value={value}
				readOnly
				className={entryCellControlClassName("bg-offwhite/35")}
			/>
		);
	}

	if (column.id === "responsibilityCenter") {
		const options = createResponsibilityCenterOptions(responsibilityCenters, row);
		const selectedValue = row.responsibilityCenterId || value;

		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				value={selectedValue}
				readOnly={isReadonly}
				options={options}
				placeholder=""
				className={EntryDropdownClassName}
				onChange={(nextValue) => {
					const selectedCenter = responsibilityCenters.find(
						(center) => center.id === String(nextValue),
					);

					onUpdateEntry(row.id, {
						responsibilityCenterId: selectedCenter?.id ?? "",
						responsibilityCenter: selectedCenter?.name ?? String(nextValue),
					});
				}}
			/>
		);
	}

	if (column.kind === "select") {
		return (
			<AppAdvancedDropdown
				id={fieldId}
				name={fieldName}
				value={value}
				readOnly={isReadonly}
				options={PurchaseRequestUomOptions.map((option) => ({
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

function createResponsibilityCenterOptions(
	centers: ResponsibilityCenter[],
	row: PurchaseRequestItem,
) {
	const options = centers
		.filter((center) => center.status === "Active")
		.map((center) => ({
			description: `${center.category} · ${center.financialType}`,
			label: center.code,
			name: center.name,
			selectedDetails: center.code,
			value: center.id,
		}));
	const hasCurrentCenter = row.responsibilityCenterId
		? options.some((option) => option.value === row.responsibilityCenterId)
		: options.some(
				(option) =>
					option.name.trim().toLowerCase() ===
					row.responsibilityCenter.trim().toLowerCase(),
			);

	if (row.responsibilityCenter && !hasCurrentCenter) {
		options.unshift({
			description: "Current responsibility center",
			label: row.responsibilityCenter,
			name: row.responsibilityCenter,
			selectedDetails: "",
			value: row.responsibilityCenterId || row.responsibilityCenter,
		});
	}

	return options;
}

const EntryDropdownClassName =
	"[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function createItemDescriptionDropdownOptions(
	itemOptions: ItemRecord[],
	value: string,
) {
	const dropdownOptions = itemOptions.map((item) => ({
		name: item.name,
		value: item.name,
	}));

	if (
		value &&
		!dropdownOptions.some(
			(option) => option.value.trim().toLowerCase() === value.trim().toLowerCase(),
		)
	) {
		return [{ name: value, value }, ...dropdownOptions];
	}

	return dropdownOptions;
}

function getPurchaseRequestItemAutoFillUpdates(
	itemOptions: ItemRecord[],
	description: string,
): Partial<PurchaseRequestItem> {
	const selectedItem = itemOptions.find(
		(item) => item.name.trim().toLowerCase() === description.trim().toLowerCase(),
	);

	if (!selectedItem) {
		return { description };
	}

	return {
		barcode: selectedItem.barcode,
		cost: selectedItem.costPrice,
		description: selectedItem.name,
		itemId: selectedItem.id,
		itemCode: selectedItem.code,
		responsibilityCenterId: selectedItem.responsibilityCenterId ?? "",
		responsibilityCenter: selectedItem.responsibilityCenter,
		serviceMaintenanceId: "",
		uom: selectedItem.uom,
	};
}

function getPurchaseRequestServiceUpdates(
	serviceOptions: ServiceMaintenanceOptionResponseDto[],
	description: string,
): Partial<PurchaseRequestItem> {
	const selectedService = serviceOptions.find((service) =>
		(service.serviceName || service.name)
			.trim()
			.toLowerCase() === description.trim().toLowerCase(),
	);

	return {
		barcode: "",
		description,
		itemId: "",
		itemCode: "",
		lotNo: "",
		serviceMaintenanceId: selectedService?.id ?? "",
		uom: "",
	};
}

function createServiceDescriptionDropdownOptions(
	serviceOptions: ServiceMaintenanceOptionResponseDto[],
	value: string,
) {
	const dropdownOptions = serviceOptions.map((service) => {
		const serviceName = service.serviceName || service.name;

		return {
			name: serviceName,
			value: serviceName,
		};
	});

	if (
		value &&
		!dropdownOptions.some(
			(option) => option.value.trim().toLowerCase() === value.trim().toLowerCase(),
		)
	) {
		return [{ name: value, value }, ...dropdownOptions];
	}

	return dropdownOptions;
}

function createCombinedDescriptionDropdownOptions(
	itemOptions: ItemRecord[],
	serviceOptions: ServiceMaintenanceOptionResponseDto[],
	value: string,
): AppAdvancedDropdownOption[] {
	const itemDropdownOptions: AppAdvancedDropdownOption[] = itemOptions.map((item) => ({
		description: "Item Master · Goods",
		label: item.code ? `[Item] ${item.code} - ${item.name}` : `[Item] ${item.name}`,
		name: item.name,
		value: item.name,
	}));

	const serviceDropdownOptions: AppAdvancedDropdownOption[] = serviceOptions.map((service) => {
		const serviceName = service.serviceName || service.name;
		return {
			description: "Service Maintenance · Services",
			label: `[Service] ${serviceName}`,
			name: serviceName,
			value: serviceName,
		};
	});

	const combined = [...itemDropdownOptions, ...serviceDropdownOptions];

	if (
		value &&
		!combined.some(
			(option) => option.value.trim().toLowerCase() === value.trim().toLowerCase(),
		)
	) {
		return [{ label: value, name: value, value }, ...combined];
	}

	return combined;
}

function getPurchaseRequestCombinedUpdates(
	itemOptions: ItemRecord[],
	serviceOptions: ServiceMaintenanceOptionResponseDto[],
	description: string,
): Partial<PurchaseRequestItem> {
	const trimmedDesc = description.trim().toLowerCase();

	const selectedItem = itemOptions.find(
		(item) => item.name.trim().toLowerCase() === trimmedDesc,
	);
	if (selectedItem) {
		return {
			barcode: selectedItem.barcode,
			cost: selectedItem.costPrice,
			description: selectedItem.name,
			itemId: selectedItem.id,
			itemCode: selectedItem.code,
			responsibilityCenterId: selectedItem.responsibilityCenterId ?? "",
			responsibilityCenter: selectedItem.responsibilityCenter,
			serviceMaintenanceId: "",
			uom: selectedItem.uom,
		};
	}

	const selectedService = serviceOptions.find(
		(service) =>
			(service.serviceName || service.name).trim().toLowerCase() === trimmedDesc,
	);
	if (selectedService) {
		const serviceName = selectedService.serviceName || selectedService.name;
		return {
			barcode: "",
			cost: 0,
			description: serviceName,
			itemId: "",
			itemCode: "",
			lotNo: "",
			serviceMaintenanceId: selectedService.id ?? "",
			uom: "",
		};
	}

	return { description };
}

function entryCellControlClassName(extraClassName?: string) {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
		extraClassName,
	);
}

const PurchaseRequestLineColumnConfigs = [
	column("Item Code", "itemCode", TextColumnKind, 150, "w-[9.5rem]"),
	column("Barcode", "barcode", TextColumnKind, 150, "w-[9.5rem]"),
	column("Description", "description", TextColumnKind, 300, "w-[18.75rem]"),
	column("UOM", "uom", SelectColumnKind, 120, "w-[7.5rem]"),
	column("Qty", "quantity", AmountColumnKind, 150, "w-[9.5rem]"),
	column("Lot No", "lotNo", TextColumnKind, 120, "w-[7.5rem]"),
	column("Cost", "cost", AmountColumnKind, 160, "w-[10rem]"),
	column("Res. Center", "responsibilityCenter", SelectColumnKind, 190, "w-[12rem]"),
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
