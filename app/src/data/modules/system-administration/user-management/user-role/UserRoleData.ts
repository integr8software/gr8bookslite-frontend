import { MainModuleCatalogSections } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  MainNavigationItem,
  MainNavigationSection,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import type { UserStatus } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export type UserRoleRecord = {
  id: string;
  name: string;
  description: string;
  accessRoles: string[];
  status: UserStatus;
};

export type UserRoleFormValues = Omit<UserRoleRecord, "id">;

export const UserPermissionActions = [
  { value: "view", label: "Read Only" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "cancel", label: "Cancel" },
  { value: "uncancel", label: "Uncancel" },
  { value: "export", label: "Print/Export" },
] as const;

export const UserAccessRoleOptions = createUserAccessRoleOptions(
  MainModuleCatalogSections,
);

export type UserAccessRoleOption = {
  value: string;
  label: string;
  children: UserAccessRoleSubmodule[];
};

export type UserAccessRoleSubmodule = {
  permissionCode: string;
  label: string;
  actions?: string[];
};

type UserPermissionActionValue = (typeof UserPermissionActions)[number]["value"];

export const InitialUserRoleFormValues: UserRoleFormValues = {
  name: "",
  description: "",
  accessRoles: [],
  status: "Active",
};

export const InitialUserRoles: UserRoleRecord[] = [
  {
    id: "user-role-admin",
    name: "Admin",
    description: "Can maintain core operations and administration records.",
    accessRoles: createAllAccessRoles(),
    status: "Active",
  },
  {
    id: "user-role-encoder",
    name: "Staff",
    description: "Can encode daily transactions and review assigned reports.",
    accessRoles: createAccessRoles([
      "DO",
      "SO",
      "SI",
      "FR",
    ]),
    status: "Active",
  },
  {
    id: "user-role-manager",
    name: "Manager",
    description: "Can approve and maintain team transactions.",
    accessRoles: [
      ...createAccessRoles(["DO"]),
      ...createAccessRoles(["SO", "SI"], [
        "view",
        "create",
        "update",
      ]),
      ...createAccessRoles(["COA"], [
        "view",
        "update",
      ]),
    ],
    status: "Active",
  },
  {
    id: "user-role-auditor",
    name: "Auditor",
    description: "Can review system records and reports.",
    accessRoles: createAccessRoles([
      "DO",
      "FR",
      "IR",
      "AT",
    ]),
    status: "Active",
  },
];

export function createUserRoleRecord(
  values: UserRoleFormValues,
): UserRoleRecord {
  return {
    id: `user-role-${Date.now()}`,
    ...trimUserRoleValues(values),
  };
}

export function updateUserRoleRecord(
  userRole: UserRoleRecord,
  values: UserRoleFormValues,
): UserRoleRecord {
  return {
    ...userRole,
    ...trimUserRoleValues(values),
  };
}

function createUserAccessRoleOptions(
  sections: MainNavigationSection[],
): UserAccessRoleOption[] {
  return sections
    .map((section) => ({
      value: section.key,
      label: section.title,
      children: collectNavigationSubmodules(section.items),
    }))
    .filter((section) => section.children.length > 0);
}

function collectNavigationSubmodules(
  items: MainNavigationItem[],
): UserAccessRoleSubmodule[] {
  return items.flatMap((item) =>
    item.children?.length
      ? collectNavigationSubmodules(item.children)
      : [
          {
            permissionCode: item.permissionCode ?? item.key,
            label: item.label,
          },
        ],
  );
}

function createAllAccessRoles() {
  return UserAccessRoleOptions.flatMap((accessModule) =>
    createAccessRoles(
      accessModule.children.map((submodule) => submodule.permissionCode),
      UserPermissionActions.map((action) => action.value),
    ),
  );
}

function createAccessRoles(
  submoduleValues: string[],
  actionValues: UserPermissionActionValue[] = ["view"],
) {
  return submoduleValues.flatMap((submoduleValue) =>
    actionValues.map((actionValue) => `${submoduleValue}.${actionValue}`),
  );
}

function trimUserRoleValues(values: UserRoleFormValues): UserRoleFormValues {
  return {
    ...values,
    name: values.name.trim(),
    description: values.description.trim(),
  };
}
