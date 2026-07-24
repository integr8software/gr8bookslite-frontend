import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseLocationAvailabilityConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-storage/location-availability/WarehouseLocationAvailabilityConstants";
import type {
  WarehouseLocationAvailabilityModule,
  WarehouseLocationAvailabilityRecord,
  WarehouseLocationAvailabilityResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/location-availability/WarehouseLocationAvailabilityTypes";

export type WarehouseLocationAvailabilityQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseLocationAvailability(
  module: WarehouseLocationAvailabilityModule,
  query: WarehouseLocationAvailabilityQuery,
): Promise<WarehouseLocationAvailabilityResponse> {
  const response = await ApiClient.get<WarehouseLocationAvailabilityResponse>(
    WarehouseLocationAvailabilityConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseLocationAvailabilityRecord(
  module: WarehouseLocationAvailabilityModule,
  values: Omit<WarehouseLocationAvailabilityRecord, "id">,
): Promise<WarehouseLocationAvailabilityRecord> {
  const response = await ApiClient.post<{ record: WarehouseLocationAvailabilityRecord }>(
    WarehouseLocationAvailabilityConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseLocationAvailabilityRecord(
  module: WarehouseLocationAvailabilityModule,
  record: WarehouseLocationAvailabilityRecord,
): Promise<WarehouseLocationAvailabilityRecord> {
  const response = await ApiClient.patch<{ record: WarehouseLocationAvailabilityRecord }>(
    `${WarehouseLocationAvailabilityConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseLocationAvailabilityQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (
    module: WarehouseLocationAvailabilityModule,
    companyId: number | null,
    warehouseId: string,
  ) => [...WarehouseLocationAvailabilityQueryKeys.all(companyId), module, warehouseId] as const,
};
