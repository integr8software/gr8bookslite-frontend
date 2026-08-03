export const InventoryCountHref = "/inventory/inventory-count";

export const InventoryCountTablePaginationStorageKey =
	"inventory-inventory-count";

export const InventoryCountWarehouseOptions = [
	"8 | Laguna",
	"Main Warehouse",
	"Cebu Warehouse",
	"Davao Warehouse",
] as const;

export const InventoryCountItemTypeOptions = [
	"ALL",
	"Inventory",
	"Non-Inventory",
	"Service",
] as const;

export const InventoryCountCategoryOptions = [
	"ALL",
	"Finished Goods",
	"Raw Materials",
	"Packaging",
] as const;

export const InventoryCountItemGroupOptions = [
	"ALL",
	"Bags",
	"Mesh",
	"Supplies",
] as const;

export const InventoryCountStatusOptions = [
	"Draft",
	"In Progress",
	"Approved",
] as const;

export const inventoryCountFieldClassName =
	"app-theme-field min-h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite read-only:bg-offwhite";
