import type { UserManagementRecord } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

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
  | "lastLogin"
  | "name"
  | "status"
  | "userRole";
