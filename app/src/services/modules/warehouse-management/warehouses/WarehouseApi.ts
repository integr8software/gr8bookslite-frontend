import {
  warehouseMaintenanceControllerCreateV1,
  warehouseMaintenanceControllerFindAllV1,
  warehouseMaintenanceControllerFindOneV1,
  warehouseMaintenanceControllerUpdateV1,
} from "@/app/src/generated/api/warehouse-maintenance/warehouse-maintenance";
import type {
  CreateWarehouseDto,
  CreateWarehouseDtoBranchAvailabilityMode,
  CreateWarehouseDtoStatus,
  WarehouseResponseDto,
  WarehouseResponseDtoBranchAvailabilityMode,
  WarehouseResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  WarehouseBranchAvailability,
  WarehouseBranchAvailabilityMode,
  WarehouseFormValues,
  WarehouseListResponse,
  WarehouseRecord,
  WarehouseStatus,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { cleanOptional } from "@/app/src/utils/string.util";

export async function fetchWarehouses(): Promise<WarehouseListResponse> {
  const response = await warehouseMaintenanceControllerFindAllV1({
    limit: 500,
    sortBy: "name",
    sortDirection: "asc",
  });

  return {
    warehouses: response.warehouses.map(mapApiWarehouse),
    statistics: response.statistics,
    permissions: response.permissions,
  };
}

export async function fetchWarehouse(id: string): Promise<WarehouseRecord> {
  const response = await warehouseMaintenanceControllerFindOneV1(id);

  return mapApiWarehouse(response.warehouse);
}

export async function createWarehouse(values: WarehouseFormValues): Promise<WarehouseRecord> {
  const response = await warehouseMaintenanceControllerCreateV1(toApiWarehousePayload(values));

  return mapApiWarehouse(response.warehouse);
}

export async function updateWarehouse(warehouse: WarehouseRecord): Promise<WarehouseRecord> {
  const response = await warehouseMaintenanceControllerUpdateV1(
    warehouse.id,
    toApiWarehousePayload(warehouse),
  );

  return mapApiWarehouse(response.warehouse);
}

export async function updateWarehouseStatus(input: {
  status: WarehouseStatus;
  warehouseId: string;
}): Promise<WarehouseRecord> {
  const response = await warehouseMaintenanceControllerUpdateV1(input.warehouseId, {
    status: mapStatusToApi(input.status),
  });

  return mapApiWarehouse(response.warehouse);
}

function mapApiWarehouse(warehouse: WarehouseResponseDto): WarehouseRecord {
  const availableBranches = warehouse.branches.map((branch) => branch.name);
  const branchUnitIds =
    warehouse.branchUnitIds.length > 0
      ? warehouse.branchUnitIds
      : warehouse.branches.map((branch) => branch.id);
  const branchName = availableBranches[0] ?? "";
  const branchAvailabilityMode = mapBranchAvailabilityModeFromApi(
    warehouse.branchAvailabilityMode,
    availableBranches,
  );

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

function toApiWarehousePayload(
  warehouse: WarehouseRecord | WarehouseFormValues,
): CreateWarehouseDto {
  return {
    code: warehouse.code.trim() || undefined,
    name: warehouse.name.trim(),
    branchUnitIds: warehouse.branchUnitIds.map(Number),
    branchAvailabilityMode: mapBranchAvailabilityModeToApi(warehouse.branchAvailabilityMode),
    managerName: cleanOptional(warehouse.managerName),
    status: mapStatusToApi(warehouse.status),
    address: cleanOptional(warehouse.address),
    contactNo: cleanOptional(warehouse.contactNo),
    description: cleanOptional(warehouse.description),
  };
}

function mapStatusFromApi(value: WarehouseResponseDtoStatus): WarehouseStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: WarehouseStatus): CreateWarehouseDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function mapBranchAvailabilityModeFromApi(
  value: WarehouseResponseDtoBranchAvailabilityMode | undefined,
  availableBranches: string[],
): WarehouseBranchAvailabilityMode {
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

function mapBranchAvailabilityModeToApi(
  value: WarehouseBranchAvailabilityMode,
): CreateWarehouseDtoBranchAvailabilityMode {
  if (value === "All Branches") {
    return "ALL";
  }

  if (value === "Except Branches") {
    return "EXCEPT";
  }

  return "SPECIFIC";
}

function getWarehouseAvailability(availableBranches: string[]): WarehouseBranchAvailability {
  if (availableBranches.length === 0) {
    return "All Branches";
  }

  return "Specific Branches";
}
