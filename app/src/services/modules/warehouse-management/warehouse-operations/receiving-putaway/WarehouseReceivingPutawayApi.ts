import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseReceivingPutawayConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-operations/receiving-putaway/WarehouseReceivingPutawayConstants";
import type {
  WarehouseReceivingPutawayModule,
  WarehouseReceivingPutawayRecord,
  WarehouseReceivingPutawayResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-operations/receiving-putaway/WarehouseReceivingPutawayTypes";

export type WarehouseReceivingPutawayQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseReceivingPutaway(
  module: WarehouseReceivingPutawayModule,
  query: WarehouseReceivingPutawayQuery,
): Promise<WarehouseReceivingPutawayResponse> {
  const response = await ApiClient.get<WarehouseReceivingPutawayResponse>(
    WarehouseReceivingPutawayConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseReceivingPutawayRecord(
  module: WarehouseReceivingPutawayModule,
  values: Omit<WarehouseReceivingPutawayRecord, "id">,
): Promise<WarehouseReceivingPutawayRecord> {
  const response = await ApiClient.post<{ record: WarehouseReceivingPutawayRecord }>(
    WarehouseReceivingPutawayConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseReceivingPutawayRecord(
  module: WarehouseReceivingPutawayModule,
  record: WarehouseReceivingPutawayRecord,
): Promise<WarehouseReceivingPutawayRecord> {
  const response = await ApiClient.patch<{ record: WarehouseReceivingPutawayRecord }>(
    `${WarehouseReceivingPutawayConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseReceivingPutawayQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseReceivingPutawayModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseReceivingPutawayQueryKeys.all(companyId), module, warehouseId] as const,
};
