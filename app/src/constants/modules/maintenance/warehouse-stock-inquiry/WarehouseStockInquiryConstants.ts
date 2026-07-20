import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

export const WarehouseStockInquiryHref = MODULE_ROUTE_MAP.WSI;

export const WarehouseStockInquiryApiPath = "/maintenance/warehouse-stock-inquiry";

export const WarehouseStockInquiryTitle = "Item Availability";

export const WarehouseStockInquiryDescription =
	"View on-hand, reserved, available, and inventory value by warehouse, item, lot, serial, and storage location.";

export const WarehouseStockInquiryActionLabel = "Refresh Inquiry";

export const WarehouseStockInquiryTableHeaders = [
	"Warehouse",
	"Item",
	"Category",
	"UOM",
	"On Hand",
	"Reserved",
	"Available",
	"Inventory Value",
	"Lot No.",
	"Serial No.",
	"Storage Location",
] as const;

export const WarehouseStockInquiryTableColumns = [
	{ id: "warehouse", label: "Warehouse", valueIndex: 0, className: "w-[14rem]" },
	{ id: "item", label: "Item", valueIndex: 1, className: "w-[16rem]" },
	{ id: "category", label: "Category", valueIndex: 2, className: "w-[11rem]" },
	{ id: "uom", label: "UOM", valueIndex: 3, className: "w-[8rem]" },
	{ id: "onHand", label: "On Hand", valueIndex: 4, className: "w-[9rem]" },
	{ id: "reserved", label: "Reserved", valueIndex: 5, className: "w-[9rem]" },
	{ id: "available", label: "Available", valueIndex: 6, className: "w-[9rem]" },
	{
		id: "inventoryValue",
		label: "Inventory Value",
		valueIndex: 7,
		className: "w-[12rem]",
	},
	{ id: "lotNumber", label: "Lot No.", valueIndex: 8, className: "w-[12rem]" },
	{ id: "serialNumber", label: "Serial No.", valueIndex: 9, className: "w-[12rem]" },
	{
		id: "storageLocation",
		label: "Storage Location",
		valueIndex: 10,
		className: "w-[15rem]",
	},
	{ id: "actions", label: "Actions", className: "w-[9rem] text-center" },
] as const;

export const WarehouseStockInquiryExportColumns: ModuleTableExportColumn<WarehouseModuleRecord>[] =
	WarehouseStockInquiryTableColumns.flatMap((column) =>
		"valueIndex" in column
			? [
					{
						header: column.label,
						id: column.id,
						value: (row) => row.values[column.valueIndex] ?? "",
					},
				]
			: [],
	);

export function getWarehouseStockInquiryTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}

export const WarehouseStockInquiryPaginationStorageKey =
	"maintenance.item-availability";
