import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseItemLocationSetupConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-storage/item-location-setup/WarehouseItemLocationSetupConstants";
import type {
  WarehouseItemLocationSetupModule,
  WarehouseItemLocationSetupRecord,
  WarehouseItemLocationSetupResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/item-location-setup/WarehouseItemLocationSetupTypes";

export type WarehouseItemLocationSetupQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseItemLocationSetup(
  module: WarehouseItemLocationSetupModule,
  query: WarehouseItemLocationSetupQuery,
): Promise<WarehouseItemLocationSetupResponse> {
  const response = await ApiClient.get<WarehouseItemLocationSetupResponse>(
    WarehouseItemLocationSetupConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseItemLocationSetupRecord(
  module: WarehouseItemLocationSetupModule,
  values: Omit<WarehouseItemLocationSetupRecord, "id">,
): Promise<WarehouseItemLocationSetupRecord> {
  const response = await ApiClient.post<{ record: WarehouseItemLocationSetupRecord }>(
    WarehouseItemLocationSetupConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseItemLocationSetupRecord(
  module: WarehouseItemLocationSetupModule,
  record: WarehouseItemLocationSetupRecord,
): Promise<WarehouseItemLocationSetupRecord> {
  const response = await ApiClient.patch<{ record: WarehouseItemLocationSetupRecord }>(
    `${WarehouseItemLocationSetupConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseItemLocationSetupQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseItemLocationSetupModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseItemLocationSetupQueryKeys.all(companyId), module, warehouseId] as const,
};
