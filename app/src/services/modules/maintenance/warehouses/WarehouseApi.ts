import { WarehouseApiPath } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ApiWarehouse,
  ApiWarehouseBranchAvailabilityMode,
  ApiWarehouseListResponse,
  ApiWarehousePayload,
  ApiWarehouseSaveResponse,
  ApiWarehouseStatus,
  WarehouseBranchAvailability,
  WarehouseBranchAvailabilityMode,
  WarehouseFormValues,
  WarehouseListResponse,
  WarehouseRecord,
  WarehouseStatus,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export async function fetchWarehouses(): Promise<WarehouseListResponse> {
  const response = await ApiClient.get<ApiWarehouseListResponse>(WarehouseApiPath, {
    params: {
      limit: 500,
      sortBy: "name",
      sortDirection: "asc",
    },
  });

  return {
    warehouses: response.data.warehouses.map(mapApiWarehouse),
    statistics: response.data.statistics,
    permissions: response.data.permissions,
  };
}

export async function fetchWarehouse(id: string): Promise<WarehouseRecord> {
  const response = await ApiClient.get<ApiWarehouseSaveResponse>(`${WarehouseApiPath}/${id}`);

  return mapApiWarehouse(response.data.warehouse);
}

export async function createWarehouse(values: WarehouseFormValues): Promise<WarehouseRecord> {
  const response = await ApiClient.post<ApiWarehouseSaveResponse>(WarehouseApiPath, toApiWarehousePayload(values));

  return mapApiWarehouse(response.data.warehouse);
}

export async function updateWarehouse(warehouse: WarehouseRecord): Promise<WarehouseRecord> {
  const response = await ApiClient.patch<ApiWarehouseSaveResponse>(`${WarehouseApiPath}/${warehouse.id}`, toApiWarehousePayload(warehouse));

  return mapApiWarehouse(response.data.warehouse);
}

export async function updateWarehouseStatus(input: { status: WarehouseStatus; warehouseId: string }): Promise<WarehouseRecord> {
  const response = await ApiClient.patch<ApiWarehouseSaveResponse>(`${WarehouseApiPath}/${input.warehouseId}`, {
    status: mapStatusToApi(input.status),
  });

  return mapApiWarehouse(response.data.warehouse);
}

function mapApiWarehouse(warehouse: ApiWarehouse): WarehouseRecord {
  const availableBranches = warehouse.branches.map((branch) => branch.name);
  const branchUnitIds = warehouse.branchUnitIds.length > 0 ? warehouse.branchUnitIds : warehouse.branches.map((branch) => branch.id);
  const branchName = availableBranches[0] ?? "";
  const branchAvailabilityMode = mapBranchAvailabilityModeFromApi(warehouse.branchAvailabilityMode, availableBranches);

  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    branchUnitIds,
    branchAvailabilityMode,
    branchName,
    availability: branchAvailabilityMode,
    availableBranches,
    managerName: warehouse.managerName ?? "",
    status: mapStatusFromApi(warehouse.status),
    address: warehouse.address ?? "",
    contactNo: warehouse.contactNo ?? "",
    description: warehouse.description ?? "",
    createdBy: warehouse.createdBy,
    createdAt: warehouse.createdAt,
    updatedBy: warehouse.updatedBy,
    updatedAt: warehouse.updatedAt,
    access: [],
    items: [],
    locations: [],
    movements: [],
    transfers: [],
  };
}

function toApiWarehousePayload(warehouse: WarehouseRecord | WarehouseFormValues): ApiWarehousePayload {
  return {
    code: warehouse.code.trim() || undefined,
    name: warehouse.name.trim(),
    branchUnitIds: warehouse.branchUnitIds,
    branchAvailabilityMode: mapBranchAvailabilityModeToApi(warehouse.branchAvailabilityMode),
    managerName: cleanOptional(warehouse.managerName),
    status: mapStatusToApi(warehouse.status),
    address: cleanOptional(warehouse.address),
    contactNo: cleanOptional(warehouse.contactNo),
    description: cleanOptional(warehouse.description),
  };
}

function mapStatusFromApi(value: ApiWarehouseStatus): WarehouseStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: WarehouseStatus): ApiWarehouseStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapBranchAvailabilityModeFromApi(value: ApiWarehouseBranchAvailabilityMode | undefined, availableBranches: string[]): WarehouseBranchAvailabilityMode {
  if (value === "ALL") {
    return "All Branches";
  }

  if (value === "EXCEPT") {
    return "Except Branches";
  }

  if (value === "SPECIFIC") {
    return "Specific Branches";
  }

  return getWarehouseAvailability(availableBranches);
}

function mapBranchAvailabilityModeToApi(value: WarehouseBranchAvailabilityMode): ApiWarehouseBranchAvailabilityMode {
  if (value === "All Branches") {
    return "ALL";
  }

  if (value === "Except Branches") {
    return "EXCEPT";
  }

  return "SPECIFIC";
}

function cleanOptional(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function getWarehouseAvailability(availableBranches: string[]): WarehouseBranchAvailability {
  if (availableBranches.length === 0) {
    return "All Branches";
  }

  return "Specific Branches";
}
