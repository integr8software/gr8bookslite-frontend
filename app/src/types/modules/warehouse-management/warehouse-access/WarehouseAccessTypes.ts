import type { useWarehouseAccessListPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-access/useWarehouseAccessListPage";
import type { WarehouseStatus } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";

export type WarehouseAccessLevel = "Viewer" | "Picker" | "Manager";
export type ApiWarehouseAccessLevel = "VIEWER" | "PICKER" | "MANAGER";
export type WarehouseAccessUserFilter = "Available" | "Assigned" | "All";

export type WarehouseAccessPermission =
  "View Stock" | "Receive Stock" | "Issue Stock" | "Transfer Stock" | "Adjust Stock" | "Manage Locations" | "View History";
export type ApiWarehouseAccessPermission =
  "VIEW_STOCK" | "RECEIVE_STOCK" | "ISSUE_STOCK" | "TRANSFER_STOCK" | "ADJUST_STOCK" | "MANAGE_LOCATIONS" | "VIEW_HISTORY";

export type ApiWarehouseAccessStatus = "ACTIVE" | "INACTIVE";

export type WarehouseAccessRecord = {
  id: string;
  warehouseCode?: string;
  warehouseId?: string;
  warehouseName?: string;
  userId?: string;
  userEmail?: string;
  userName: string;
  accessLevel: WarehouseAccessLevel;
  permissions: WarehouseAccessPermission[];
  status: WarehouseStatus;
};

export type WarehouseAccessDirectoryUser = {
  branchName: string;
  branchNames: string[];
  branchUnitIds: string[];
  companyRoleId: string | null;
  companyRoleName: string | null;
  contactNumber: string | null;
  email: string;
  id: string;
  name: string;
  status: string;
};

export type WarehouseAccessDirectoryBranch = {
  id: string;
  name: string;
};

export type ApiWarehouseAccessRecord = {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  userId: number;
  userName: string;
  userEmail: string;
  accessLevel: ApiWarehouseAccessLevel;
  permissions: ApiWarehouseAccessPermission[];
  status: ApiWarehouseAccessStatus;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
};

export type WarehouseAccessStatistics = {
  totalAssignments: number;
  activeAssignments: number;
  inactiveAssignments: number;
  managerAssignments: number;
  pickerAssignments: number;
  viewerAssignments: number;
};

export type WarehouseAccessPermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
};

export type ApiWarehouseAccessListResponse = {
  warehouseAccess: ApiWarehouseAccessRecord[];
  statistics: WarehouseAccessStatistics;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  permissions: WarehouseAccessPermissions;
};

export type WarehouseAccessListResponse = {
  warehouseAccess: WarehouseAccessRecord[];
  statistics: WarehouseAccessStatistics;
  permissions: WarehouseAccessPermissions;
};

export type ApiWarehouseAccessSaveResponse = {
  warehouseAccess: ApiWarehouseAccessRecord;
};

export type ApiWarehouseAccessCreateResponse = {
  warehouseAccess: ApiWarehouseAccessRecord[];
};

export type ApiWarehouseAccessDirectoryResponse = {
  users: Array<{
    id: number;
    name: string;
    email: string;
    contactNumber: string | null;
    status: string;
    branchUnitIds: number[];
    branchNames: string[];
    companyRoleId: number | null;
    companyRoleName: string | null;
  }>;
  branches: Array<{
    id: number;
    name: string;
  }>;
};

export type WarehouseAccessDirectoryResponse = {
  users: WarehouseAccessDirectoryUser[];
  branches: WarehouseAccessDirectoryBranch[];
};

export type WarehouseAccessFormValues = {
  accessLevel: WarehouseAccessLevel;
  permissions: WarehouseAccessPermission[];
  status: WarehouseStatus;
  userEmail?: string;
  userId: string;
  userName: string;
  warehouseId: string;
};

export type WarehouseAccessFormErrors = Record<string, Partial<Record<keyof WarehouseAccessRecord | "permissions", string>>>;

export type WarehouseAccessListRecord = {
  id: string;
  recordId: string;
  status: WarehouseStatus;
  values: string[];
  warehouseId: string;
};

export type WarehouseAccessTableProps = {
  hasActiveFilters: boolean;
  page: ReturnType<typeof useWarehouseAccessListPage>;
};
