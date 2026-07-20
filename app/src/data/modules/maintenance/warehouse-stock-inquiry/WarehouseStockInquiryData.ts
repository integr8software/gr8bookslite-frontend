import { createWarehouseModuleRows } from "@/app/src/data/modules/maintenance/warehouses/WarehouseModuleData";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export function createWarehouseStockInquiryRows(warehouses: WarehouseRecord[]) {
	return createWarehouseModuleRows("stock-inquiry", warehouses);
}
