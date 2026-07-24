import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseCapacityStorageRulesConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-storage/capacity-storage-rules/WarehouseCapacityStorageRulesConstants";
import type {
  WarehouseCapacityStorageRulesModule,
  WarehouseCapacityStorageRulesRecord,
  WarehouseCapacityStorageRulesResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/capacity-storage-rules/WarehouseCapacityStorageRulesTypes";

export type WarehouseCapacityStorageRulesQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseCapacityStorageRules(
  module: WarehouseCapacityStorageRulesModule,
  query: WarehouseCapacityStorageRulesQuery,
): Promise<WarehouseCapacityStorageRulesResponse> {
  const response = await ApiClient.get<WarehouseCapacityStorageRulesResponse>(
    WarehouseCapacityStorageRulesConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseCapacityStorageRulesRecord(
  module: WarehouseCapacityStorageRulesModule,
  values: Omit<WarehouseCapacityStorageRulesRecord, "id">,
): Promise<WarehouseCapacityStorageRulesRecord> {
  const response = await ApiClient.post<{ record: WarehouseCapacityStorageRulesRecord }>(
    WarehouseCapacityStorageRulesConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseCapacityStorageRulesRecord(
  module: WarehouseCapacityStorageRulesModule,
  record: WarehouseCapacityStorageRulesRecord,
): Promise<WarehouseCapacityStorageRulesRecord> {
  const response = await ApiClient.patch<{ record: WarehouseCapacityStorageRulesRecord }>(
    `${WarehouseCapacityStorageRulesConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseCapacityStorageRulesQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (
    module: WarehouseCapacityStorageRulesModule,
    companyId: number | null,
    warehouseId: string,
  ) => [...WarehouseCapacityStorageRulesQueryKeys.all(companyId), module, warehouseId] as const,
};
