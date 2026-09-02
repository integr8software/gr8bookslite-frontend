import { WarehouseAccessApiPath } from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import {
  warehouseAccessControllerCreateV1,
  warehouseAccessControllerFindAllV1,
  warehouseAccessControllerFindDirectoryUsersV1,
  warehouseAccessControllerFindOneV1,
  warehouseAccessControllerRevokeV1,
  warehouseAccessControllerUpdateV1,
} from "@/app/src/generated/api/warehouse-access/warehouse-access";
import type {
  CreateWarehouseAccessAssignmentDtoAccessLevel,
  CreateWarehouseAccessAssignmentDtoPermissionsItem,
  CreateWarehouseAccessAssignmentDtoStatus,
  WarehouseAccessResponseDto,
  WarehouseAccessResponseDtoAccessLevel,
  WarehouseAccessResponseDtoPermissionsItem,
  WarehouseAccessResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  CreateWarehouseAccessAssignmentDtoPermissionsItem as CreateWarehouseAccessPermission,
  WarehouseAccessResponseDtoPermissionsItem as WarehouseAccessResponsePermission,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  WarehouseAccessDirectoryResponse,
  WarehouseAccessFormValues,
  WarehouseAccessLevel,
  WarehouseAccessListResponse,
  WarehouseAccessPermission,
  WarehouseAccessRecord,
} from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";
import type { WarehouseStatus } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";

export { WarehouseAccessApiPath };

export type FetchWarehouseAccessParams = {
  warehouseId?: string;
  search?: string;
  status?: WarehouseStatus | "All";
  permission?: WarehouseAccessPermission | "All";
  limit?: number;
};

export async function fetchWarehouseAccess(
  params: FetchWarehouseAccessParams = {},
): Promise<WarehouseAccessListResponse> {
  const response = await warehouseAccessControllerFindAllV1({
    warehouseId: params.warehouseId || undefined,
    search: params.search?.trim() || undefined,
    status: params.status && params.status !== "All" ? mapStatusToApi(params.status) : undefined,
    permission:
      params.permission && params.permission !== "All"
        ? mapPermissionToApi(params.permission)
        : undefined,
    limit: params.limit ?? 500,
    sortBy: "warehouse",
    sortDirection: "asc",
  });

  return {
    warehouseAccess: response.warehouseAccess.map(mapApiWarehouseAccess),
    statistics: response.statistics,
    permissions: response.permissions,
  };
}

export async function fetchWarehouseAccessRecord(recordId: string): Promise<WarehouseAccessRecord> {
  const response = await warehouseAccessControllerFindOneV1(recordId);

  return mapApiWarehouseAccess(response.warehouseAccess);
}

export async function fetchWarehouseAccessDirectory(): Promise<WarehouseAccessDirectoryResponse> {
  const response = await warehouseAccessControllerFindDirectoryUsersV1();

  return {
    users: response.users.map((user) => ({
      branchName: user.branchNames[0] ?? "All branches",
      branchNames: user.branchNames,
      branchUnitIds: user.branchUnitIds.map(String),
      companyRoleId: user.companyRoleId === null ? null : String(user.companyRoleId),
      companyRoleName: user.companyRoleName,
      contactNumber: user.contactNumber,
      email: user.email,
      id: String(user.id),
      name: user.name,
      status: user.status,
    })),
    branches: response.branches.map((branch) => ({
      id: String(branch.id),
      name: branch.name,
    })),
  };
}

export async function createWarehouseAccess(
  values: WarehouseAccessFormValues,
): Promise<WarehouseAccessRecord> {
  const created = await createWarehouseAccessAssignments([
    {
      warehouseId: values.warehouseId,
      userId: values.userId,
      permissions: values.permissions,
      status: values.status,
      accessLevel: values.accessLevel,
    },
  ]);

  const createdRecord = created[0];

  if (!createdRecord) {
    throw new Error("Warehouse access was not created.");
  }

  return createdRecord;
}

export async function createWarehouseAccessAssignments(
  assignments: Array<{
    warehouseId: string;
    userId: string;
    permissions: WarehouseAccessPermission[];
    status?: WarehouseStatus;
    accessLevel?: WarehouseAccessLevel;
  }>,
): Promise<WarehouseAccessRecord[]> {
  const response = await warehouseAccessControllerCreateV1({
    assignments: assignments.map((assignment) => ({
      warehouseId: assignment.warehouseId,
      userId: Number(assignment.userId),
      accessLevel: assignment.accessLevel ? mapAccessLevelToApi(assignment.accessLevel) : undefined,
      permissions: assignment.permissions.map(mapPermissionToApi),
      status: assignment.status ? mapStatusToApi(assignment.status) : undefined,
    })),
  });

  return response.warehouseAccess.map(mapApiWarehouseAccess);
}

export async function updateWarehouseAccess(
  record: WarehouseAccessRecord,
): Promise<WarehouseAccessRecord> {
  const response = await warehouseAccessControllerUpdateV1(record.id, {
    accessLevel: mapAccessLevelToApi(record.accessLevel),
    permissions: record.permissions.map(mapPermissionToApi),
    status: mapStatusToApi(record.status),
  });

  return mapApiWarehouseAccess(response.warehouseAccess);
}

export async function revokeWarehouseAccess(recordId: string): Promise<WarehouseAccessRecord> {
  const response = await warehouseAccessControllerRevokeV1(recordId);

  return mapApiWarehouseAccess(response.warehouseAccess);
}

export function mapApiWarehouseAccess(record: WarehouseAccessResponseDto): WarehouseAccessRecord {
  return {
    accessLevel: mapAccessLevelFromApi(record.accessLevel),
    id: record.id,
    permissions: record.permissions.map(mapPermissionFromApi),
    status: mapStatusFromApi(record.status),
    userEmail: record.userEmail,
    userId: String(record.userId),
    userName: record.userName,
    warehouseCode: record.warehouseCode,
    warehouseId: record.warehouseId,
    warehouseName: record.warehouseName,
  };
}

function mapAccessLevelFromApi(value: WarehouseAccessResponseDtoAccessLevel): WarehouseAccessLevel {
  if (value === "MANAGER") return "Manager";
  if (value === "PICKER") return "Picker";
  return "Viewer";
}

function mapAccessLevelToApi(
  value: WarehouseAccessLevel,
): CreateWarehouseAccessAssignmentDtoAccessLevel {
  if (value === "Manager") return "MANAGER";
  if (value === "Picker") return "PICKER";
  return "VIEWER";
}

function mapPermissionFromApi(
  value: WarehouseAccessResponseDtoPermissionsItem,
): WarehouseAccessPermission {
  if (value === "RECEIVE_STOCK") return "Receive Stock";
  if (value === "ISSUE_STOCK") return "Issue Stock";
  if (value === "TRANSFER_STOCK") return "Transfer Stock";
  if (value === "ADJUST_STOCK") return "Adjust Stock";
  if (value === WarehouseAccessResponsePermission.MANAGE_LOCATIONS) return "Manage Locations";
  if (value === WarehouseAccessResponsePermission.VIEW_HISTORY) return "View History";
  return "View Stock";
}

function mapPermissionToApi(
  value: WarehouseAccessPermission,
): CreateWarehouseAccessAssignmentDtoPermissionsItem {
  if (value === "Receive Stock") return "RECEIVE_STOCK";
  if (value === "Issue Stock") return "ISSUE_STOCK";
  if (value === "Transfer Stock") return "TRANSFER_STOCK";
  if (value === "Adjust Stock") return "ADJUST_STOCK";
  if (value === "Manage Locations") return CreateWarehouseAccessPermission.MANAGE_LOCATIONS;
  if (value === "View History") return CreateWarehouseAccessPermission.VIEW_HISTORY;
  return CreateWarehouseAccessPermission.VIEW_STOCK;
}

function mapStatusFromApi(value: WarehouseAccessResponseDtoStatus): WarehouseStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: WarehouseStatus): CreateWarehouseAccessAssignmentDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
