import { WarehouseAccessApiPath } from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ApiWarehouseAccessCreateResponse,
  ApiWarehouseAccessDirectoryResponse,
  ApiWarehouseAccessLevel,
  ApiWarehouseAccessListResponse,
  ApiWarehouseAccessPermission,
  ApiWarehouseAccessRecord,
  ApiWarehouseAccessSaveResponse,
  ApiWarehouseAccessStatus,
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

export async function fetchWarehouseAccess(params: FetchWarehouseAccessParams = {}): Promise<WarehouseAccessListResponse> {
  const response = await ApiClient.get<ApiWarehouseAccessListResponse>(WarehouseAccessApiPath, {
    params: {
      warehouseId: params.warehouseId || undefined,
      search: params.search?.trim() || undefined,
      status: params.status && params.status !== "All" ? mapStatusToApi(params.status) : undefined,
      permission: params.permission && params.permission !== "All" ? mapPermissionToApi(params.permission) : undefined,
      limit: params.limit ?? 500,
      sortBy: "warehouse",
      sortDirection: "asc",
    },
  });

  return {
    warehouseAccess: response.data.warehouseAccess.map(mapApiWarehouseAccess),
    statistics: response.data.statistics,
    permissions: response.data.permissions,
  };
}

export async function fetchWarehouseAccessRecord(recordId: string): Promise<WarehouseAccessRecord> {
  const response = await ApiClient.get<ApiWarehouseAccessSaveResponse>(`${WarehouseAccessApiPath}/${recordId}`);

  return mapApiWarehouseAccess(response.data.warehouseAccess);
}

export async function fetchWarehouseAccessDirectory(): Promise<WarehouseAccessDirectoryResponse> {
  const response = await ApiClient.get<ApiWarehouseAccessDirectoryResponse>(`${WarehouseAccessApiPath}/directory/users`);

  return {
    users: response.data.users.map((user) => ({
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
    branches: response.data.branches.map((branch) => ({
      id: String(branch.id),
      name: branch.name,
    })),
  };
}

export async function createWarehouseAccess(values: WarehouseAccessFormValues): Promise<WarehouseAccessRecord> {
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
  const response = await ApiClient.post<ApiWarehouseAccessCreateResponse>(WarehouseAccessApiPath, {
    assignments: assignments.map((assignment) => ({
      warehouseId: assignment.warehouseId,
      userId: Number(assignment.userId),
      accessLevel: assignment.accessLevel ? mapAccessLevelToApi(assignment.accessLevel) : undefined,
      permissions: assignment.permissions.map(mapPermissionToApi),
      status: assignment.status ? mapStatusToApi(assignment.status) : undefined,
    })),
  });

  return response.data.warehouseAccess.map(mapApiWarehouseAccess);
}

export async function updateWarehouseAccess(record: WarehouseAccessRecord): Promise<WarehouseAccessRecord> {
  const response = await ApiClient.patch<ApiWarehouseAccessSaveResponse>(`${WarehouseAccessApiPath}/${record.id}`, {
    accessLevel: mapAccessLevelToApi(record.accessLevel),
    permissions: record.permissions.map(mapPermissionToApi),
    status: mapStatusToApi(record.status),
  });

  return mapApiWarehouseAccess(response.data.warehouseAccess);
}

export async function revokeWarehouseAccess(recordId: string): Promise<WarehouseAccessRecord> {
  const response = await ApiClient.delete<ApiWarehouseAccessSaveResponse>(`${WarehouseAccessApiPath}/${recordId}`);

  return mapApiWarehouseAccess(response.data.warehouseAccess);
}

export function mapApiWarehouseAccess(record: ApiWarehouseAccessRecord): WarehouseAccessRecord {
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

function mapAccessLevelFromApi(value: ApiWarehouseAccessLevel): WarehouseAccessLevel {
  if (value === "MANAGER") return "Manager";
  if (value === "PICKER") return "Picker";
  return "Viewer";
}

function mapAccessLevelToApi(value: WarehouseAccessLevel): ApiWarehouseAccessLevel {
  if (value === "Manager") return "MANAGER";
  if (value === "Picker") return "PICKER";
  return "VIEWER";
}

function mapPermissionFromApi(value: ApiWarehouseAccessPermission): WarehouseAccessPermission {
  if (value === "RECEIVE_STOCK") return "Receive Stock";
  if (value === "ISSUE_STOCK") return "Issue Stock";
  if (value === "TRANSFER_STOCK") return "Transfer Stock";
  if (value === "ADJUST_STOCK") return "Adjust Stock";
  if (value === "MANAGE_LOCATIONS") return "Manage Locations";
  if (value === "VIEW_HISTORY") return "View History";
  return "View Stock";
}

function mapPermissionToApi(value: WarehouseAccessPermission): ApiWarehouseAccessPermission {
  if (value === "Receive Stock") return "RECEIVE_STOCK";
  if (value === "Issue Stock") return "ISSUE_STOCK";
  if (value === "Transfer Stock") return "TRANSFER_STOCK";
  if (value === "Adjust Stock") return "ADJUST_STOCK";
  if (value === "Manage Locations") return "MANAGE_LOCATIONS";
  if (value === "View History") return "VIEW_HISTORY";
  return "VIEW_STOCK";
}

function mapStatusFromApi(value: ApiWarehouseAccessStatus): WarehouseStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: WarehouseStatus): ApiWarehouseAccessStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
