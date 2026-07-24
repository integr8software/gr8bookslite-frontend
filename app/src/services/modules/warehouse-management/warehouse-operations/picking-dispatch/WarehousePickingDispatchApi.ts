import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehousePickingDispatchConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-operations/picking-dispatch/WarehousePickingDispatchConstants";
import type {
  WarehousePickingDispatchModule,
  WarehousePickingDispatchRecord,
  WarehousePickingDispatchResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-operations/picking-dispatch/WarehousePickingDispatchTypes";

export type WarehousePickingDispatchQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehousePickingDispatch(
  module: WarehousePickingDispatchModule,
  query: WarehousePickingDispatchQuery,
): Promise<WarehousePickingDispatchResponse> {
  const response = await ApiClient.get<WarehousePickingDispatchResponse>(
    WarehousePickingDispatchConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehousePickingDispatchRecord(
  module: WarehousePickingDispatchModule,
  values: Omit<WarehousePickingDispatchRecord, "id">,
): Promise<WarehousePickingDispatchRecord> {
  const response = await ApiClient.post<{ record: WarehousePickingDispatchRecord }>(
    WarehousePickingDispatchConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehousePickingDispatchRecord(
  module: WarehousePickingDispatchModule,
  record: WarehousePickingDispatchRecord,
): Promise<WarehousePickingDispatchRecord> {
  const response = await ApiClient.patch<{ record: WarehousePickingDispatchRecord }>(
    `${WarehousePickingDispatchConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehousePickingDispatchQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehousePickingDispatchModule, companyId: number | null, warehouseId: string) =>
    [...WarehousePickingDispatchQueryKeys.all(companyId), module, warehouseId] as const,
};
