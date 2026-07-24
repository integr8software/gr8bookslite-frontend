import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseStockAdjustmentConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-operations/stock-adjustment/WarehouseStockAdjustmentConstants";
import type {
  WarehouseStockAdjustmentModule,
  WarehouseStockAdjustmentRecord,
  WarehouseStockAdjustmentResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-operations/stock-adjustment/WarehouseStockAdjustmentTypes";

export type WarehouseStockAdjustmentQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseStockAdjustment(
  module: WarehouseStockAdjustmentModule,
  query: WarehouseStockAdjustmentQuery,
): Promise<WarehouseStockAdjustmentResponse> {
  const response = await ApiClient.get<WarehouseStockAdjustmentResponse>(
    WarehouseStockAdjustmentConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseStockAdjustmentRecord(
  module: WarehouseStockAdjustmentModule,
  values: Omit<WarehouseStockAdjustmentRecord, "id">,
): Promise<WarehouseStockAdjustmentRecord> {
  const response = await ApiClient.post<{ record: WarehouseStockAdjustmentRecord }>(
    WarehouseStockAdjustmentConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseStockAdjustmentRecord(
  module: WarehouseStockAdjustmentModule,
  record: WarehouseStockAdjustmentRecord,
): Promise<WarehouseStockAdjustmentRecord> {
  const response = await ApiClient.patch<{ record: WarehouseStockAdjustmentRecord }>(
    `${WarehouseStockAdjustmentConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseStockAdjustmentQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseStockAdjustmentModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseStockAdjustmentQueryKeys.all(companyId), module, warehouseId] as const,
};
