import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseItemAvailabilityConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-inventory/item-availability/WarehouseItemAvailabilityConstants";
import type {
  WarehouseItemAvailabilityModule,
  WarehouseItemAvailabilityRecord,
  WarehouseItemAvailabilityResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-inventory/item-availability/WarehouseItemAvailabilityTypes";

export type WarehouseItemAvailabilityQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseItemAvailability(
  module: WarehouseItemAvailabilityModule,
  query: WarehouseItemAvailabilityQuery,
): Promise<WarehouseItemAvailabilityResponse> {
  const response = await ApiClient.get<WarehouseItemAvailabilityResponse>(
    WarehouseItemAvailabilityConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseItemAvailabilityRecord(
  module: WarehouseItemAvailabilityModule,
  values: Omit<WarehouseItemAvailabilityRecord, "id">,
): Promise<WarehouseItemAvailabilityRecord> {
  const response = await ApiClient.post<{ record: WarehouseItemAvailabilityRecord }>(
    WarehouseItemAvailabilityConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseItemAvailabilityRecord(
  module: WarehouseItemAvailabilityModule,
  record: WarehouseItemAvailabilityRecord,
): Promise<WarehouseItemAvailabilityRecord> {
  const response = await ApiClient.patch<{ record: WarehouseItemAvailabilityRecord }>(
    `${WarehouseItemAvailabilityConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseItemAvailabilityQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseItemAvailabilityModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseItemAvailabilityQueryKeys.all(companyId), module, warehouseId] as const,
};
