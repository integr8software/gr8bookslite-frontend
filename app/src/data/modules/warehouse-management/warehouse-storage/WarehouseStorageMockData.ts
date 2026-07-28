import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { createWarehouseStorageLayoutMockWarehouses } from "@/app/src/data/modules/warehouse-management/warehouse-storage/WarehouseStorageLayoutMockData";

export function createWarehouseStorageDemoWarehouses(warehouses: WarehouseRecord[]) {
  return createWarehouseStorageLayoutMockWarehouses(warehouses);
}
