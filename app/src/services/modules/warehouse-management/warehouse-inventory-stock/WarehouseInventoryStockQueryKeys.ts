export const WarehouseInventoryStockQueryKeys = {
	all: () => ["maintenance", "warehouse-inventory-stock"] as const,
	list: () => [...WarehouseInventoryStockQueryKeys.all(), "list"] as const,
};
