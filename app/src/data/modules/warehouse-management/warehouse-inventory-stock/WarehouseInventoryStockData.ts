import { createWarehouseModuleRows } from "@/app/src/data/modules/warehouse-management/warehouses/WarehouseModuleData";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";

export function createWarehouseInventoryStockRows(warehouses: WarehouseRecord[]) {
	return createWarehouseModuleRows("stock-inquiry", warehouses);
}
