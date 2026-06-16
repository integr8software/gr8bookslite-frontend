import type { UserRoleFormValues } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleData";

export type UserManagementActionMode = "add" | "edit" | "view";

export type UserStatus = "Active" | "Inactive" | "Pending";

export type UserManagementRecord = {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  userRoleId: string;
  status: UserStatus;
  lastLogin?: string;
  profileImageUrl?: string;
};

export type UserFormValues = Omit<UserManagementRecord, "id">;

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export type UserRoleFormErrors = Partial<
  Record<keyof UserRoleFormValues, string>
>;
