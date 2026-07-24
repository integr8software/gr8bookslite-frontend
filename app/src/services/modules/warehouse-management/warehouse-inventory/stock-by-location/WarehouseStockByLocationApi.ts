import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseStockByLocationConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-inventory/stock-by-location/WarehouseStockByLocationConstants";
import type {
  WarehouseStockByLocationModule,
  WarehouseStockByLocationRecord,
  WarehouseStockByLocationResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-inventory/stock-by-location/WarehouseStockByLocationTypes";

export type WarehouseStockByLocationQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseStockByLocation(
  module: WarehouseStockByLocationModule,
  query: WarehouseStockByLocationQuery,
): Promise<WarehouseStockByLocationResponse> {
  const response = await ApiClient.get<WarehouseStockByLocationResponse>(
    WarehouseStockByLocationConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseStockByLocationRecord(
  module: WarehouseStockByLocationModule,
  values: Omit<WarehouseStockByLocationRecord, "id">,
): Promise<WarehouseStockByLocationRecord> {
  const response = await ApiClient.post<{ record: WarehouseStockByLocationRecord }>(
    WarehouseStockByLocationConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseStockByLocationRecord(
  module: WarehouseStockByLocationModule,
  record: WarehouseStockByLocationRecord,
): Promise<WarehouseStockByLocationRecord> {
  const response = await ApiClient.patch<{ record: WarehouseStockByLocationRecord }>(
    `${WarehouseStockByLocationConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseStockByLocationQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseStockByLocationModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseStockByLocationQueryKeys.all(companyId), module, warehouseId] as const,
};
