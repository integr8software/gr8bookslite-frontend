import type {
  UserFormValues,
  UserGroupFormValues,
  UserTypeFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export type UserManagementActionMode = "add" | "edit" | "view";

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export type UserTypeFormErrors = Partial<
  Record<keyof UserTypeFormValues, string>
>;

export type UserGroupFormErrors = Partial<
  Record<keyof UserGroupFormValues, string>
>;
