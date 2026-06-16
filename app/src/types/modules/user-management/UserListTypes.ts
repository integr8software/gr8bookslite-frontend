import type { UserManagementRecord } from "@/app/src/types/modules/user-management/UserManagementTypes";

export type UserListStatus = "Active" | "Pending" | "Inactive";

export type UserListRecord = {
  id: string;
  name: string;
  username: string;
  email: string;
  contactNo: string;
  userRole: string;
  status: UserListStatus;
  lastLogin: string;
  lastLoginMeta: string;
  profileImageUrl?: string;
};

export type UserListTableRecord = UserManagementRecord & {
  userRole: string;
};

export type UserListTableColumnKey =
  | "email"
  | "name"
  | "userRole";

export type BranchUserRolePermissionApiResponse = {
  permissionId: number;
  permissionCode: string;
  permissionName?: string;
  moduleCode: string;
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canCancel?: boolean;
  canUncancel?: boolean;
  canExport: boolean;
  actions?: string[];
};

export type BranchPermissionCatalogApiResponse = {
  modules: {
    code: string;
    name: string;
    submodules: {
      code: string;
      name: string;
      permissionCode: string;
      actions: string[];
    }[];
  }[];
};

export type BranchUserRoleApiResponse = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  roleType: string;
  scopeLevel: string;
  isSystem: boolean;
  isActive?: boolean;
  permissions: BranchUserRolePermissionApiResponse[];
};

export type BranchUserApiRecord = {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  status: string;
  profileImageUrl: string | null;
  membershipRole: string;
  membershipStatus: string;
  accessScope: string;
  lastAccessedAt: string | null;
  companyRole: BranchUserRoleApiResponse | null;
};

export type BranchUserApiResponse = {
  unit: {
    id: number;
    companyId: number;
    code: string | null;
    name: string;
    displayName: string | null;
    type: string;
  };
  users: BranchUserApiRecord[];
};
