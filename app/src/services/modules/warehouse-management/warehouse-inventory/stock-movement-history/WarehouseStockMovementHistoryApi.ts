import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseStockMovementHistoryConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-inventory/stock-movement-history/WarehouseStockMovementHistoryConstants";
import type {
  WarehouseStockMovementHistoryModule,
  WarehouseStockMovementHistoryRecord,
  WarehouseStockMovementHistoryResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-inventory/stock-movement-history/WarehouseStockMovementHistoryTypes";

export type WarehouseStockMovementHistoryQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseStockMovementHistory(
  module: WarehouseStockMovementHistoryModule,
  query: WarehouseStockMovementHistoryQuery,
): Promise<WarehouseStockMovementHistoryResponse> {
  const response = await ApiClient.get<WarehouseStockMovementHistoryResponse>(
    WarehouseStockMovementHistoryConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseStockMovementHistoryRecord(
  module: WarehouseStockMovementHistoryModule,
  values: Omit<WarehouseStockMovementHistoryRecord, "id">,
): Promise<WarehouseStockMovementHistoryRecord> {
  const response = await ApiClient.post<{ record: WarehouseStockMovementHistoryRecord }>(
    WarehouseStockMovementHistoryConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseStockMovementHistoryRecord(
  module: WarehouseStockMovementHistoryModule,
  record: WarehouseStockMovementHistoryRecord,
): Promise<WarehouseStockMovementHistoryRecord> {
  const response = await ApiClient.patch<{ record: WarehouseStockMovementHistoryRecord }>(
    `${WarehouseStockMovementHistoryConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseStockMovementHistoryQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (
    module: WarehouseStockMovementHistoryModule,
    companyId: number | null,
    warehouseId: string,
  ) => [...WarehouseStockMovementHistoryQueryKeys.all(companyId), module, warehouseId] as const,
};
