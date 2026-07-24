import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseStockByWarehouseConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-inventory/stock-by-warehouse/WarehouseStockByWarehouseConstants";
import type {
  WarehouseStockByWarehouseModule,
  WarehouseStockByWarehouseRecord,
  WarehouseStockByWarehouseResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-inventory/stock-by-warehouse/WarehouseStockByWarehouseTypes";

export type WarehouseStockByWarehouseQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseStockByWarehouse(
  module: WarehouseStockByWarehouseModule,
  query: WarehouseStockByWarehouseQuery,
): Promise<WarehouseStockByWarehouseResponse> {
  const response = await ApiClient.get<WarehouseStockByWarehouseResponse>(
    WarehouseStockByWarehouseConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseStockByWarehouseRecord(
  module: WarehouseStockByWarehouseModule,
  values: Omit<WarehouseStockByWarehouseRecord, "id">,
): Promise<WarehouseStockByWarehouseRecord> {
  const response = await ApiClient.post<{ record: WarehouseStockByWarehouseRecord }>(
    WarehouseStockByWarehouseConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseStockByWarehouseRecord(
  module: WarehouseStockByWarehouseModule,
  record: WarehouseStockByWarehouseRecord,
): Promise<WarehouseStockByWarehouseRecord> {
  const response = await ApiClient.patch<{ record: WarehouseStockByWarehouseRecord }>(
    `${WarehouseStockByWarehouseConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseStockByWarehouseQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseStockByWarehouseModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseStockByWarehouseQueryKeys.all(companyId), module, warehouseId] as const,
};
