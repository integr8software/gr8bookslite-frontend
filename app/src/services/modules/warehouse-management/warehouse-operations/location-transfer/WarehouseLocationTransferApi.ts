import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { WarehouseLocationTransferConfigs } from "@/app/src/constants/modules/warehouse-management/warehouse-operations/location-transfer/WarehouseLocationTransferConstants";
import type {
  WarehouseLocationTransferModule,
  WarehouseLocationTransferRecord,
  WarehouseLocationTransferResponse,
} from "@/app/src/types/modules/warehouse-management/warehouse-operations/location-transfer/WarehouseLocationTransferTypes";

export type WarehouseLocationTransferQuery = {
  companyId: number;
  warehouseId?: string;
};

export async function fetchWarehouseLocationTransfer(
  module: WarehouseLocationTransferModule,
  query: WarehouseLocationTransferQuery,
): Promise<WarehouseLocationTransferResponse> {
  const response = await ApiClient.get<WarehouseLocationTransferResponse>(
    WarehouseLocationTransferConfigs[module].apiPath,
    { params: query },
  );
  return response.data;
}

export async function createWarehouseLocationTransferRecord(
  module: WarehouseLocationTransferModule,
  values: Omit<WarehouseLocationTransferRecord, "id">,
): Promise<WarehouseLocationTransferRecord> {
  const response = await ApiClient.post<{ record: WarehouseLocationTransferRecord }>(
    WarehouseLocationTransferConfigs[module].apiPath,
    values,
  );
  return response.data.record;
}

export async function updateWarehouseLocationTransferRecord(
  module: WarehouseLocationTransferModule,
  record: WarehouseLocationTransferRecord,
): Promise<WarehouseLocationTransferRecord> {
  const response = await ApiClient.patch<{ record: WarehouseLocationTransferRecord }>(
    `${WarehouseLocationTransferConfigs[module].apiPath}/${record.id}`,
    record,
  );
  return response.data.record;
}

export const WarehouseLocationTransferQueryKeys = {
  all: (companyId: number | null) => ["warehouse-management", "workspace", companyId] as const,
  list: (module: WarehouseLocationTransferModule, companyId: number | null, warehouseId: string) =>
    [...WarehouseLocationTransferQueryKeys.all(companyId), module, warehouseId] as const,
};
