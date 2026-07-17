export const WarehouseStockInquiryHref = "/maintenance/warehouse-stock-inquiry";

export const WarehouseStockInquiryApiPath = "/maintenance/warehouse-stock-inquiry";

export const WarehouseStockInquiryTitle = "Warehouse Stock Inquiry";

export const WarehouseStockInquiryDescription =
	"View on-hand, reserved, available, and inventory value by warehouse, item, category, brand, supplier, lot, serial, and location.";

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

export const WarehouseStockInquiryPaginationStorageKey =
	"maintenance.warehouse-stock-inquiry";
