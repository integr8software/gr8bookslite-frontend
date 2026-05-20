import type {
  DepartmentFormValues,
  UserFormValues,
  UserRoleFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export type UserManagementActionMode = "add" | "edit" | "view";

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export type UserRoleFormErrors = Partial<
  Record<keyof UserRoleFormValues, string>
>;

export type DepartmentFormErrors = Partial<
  Record<keyof DepartmentFormValues, string>
>;
