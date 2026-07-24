import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseStockCountConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-operations/stock-count/WarehouseStockCountConstants";
import type {
  WarehouseStockCountModule,
  WarehouseStockCountRecord,
  WarehouseStockCountResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-operations/stock-count/WarehouseStockCountTypes";

export type WarehouseStockCountQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseStockCount(
  module: WarehouseStockCountModule,
  query: WarehouseStockCountQuery,
): Promise<WarehouseStockCountResponse> {
  const response = await ApiClient.get<WarehouseStockCountResponse>(
    WarehouseStockCountConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseStockCountRecord(
  module: WarehouseStockCountModule,
  values: Omit<WarehouseStockCountRecord, "id">,
): Promise<WarehouseStockCountRecord> {
  const response = await ApiClient.post<{ record: WarehouseStockCountRecord }>(
    WarehouseStockCountConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseStockCountRecord(
  module: WarehouseStockCountModule,
  record: WarehouseStockCountRecord,
): Promise<WarehouseStockCountRecord> {
  const response = await ApiClient.patch<{ record: WarehouseStockCountRecord }>(
    `${WarehouseStockCountConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseStockCountQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseStockCountModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseStockCountQueryKeys.all(companyId), module, warehouseId] as const,
};
