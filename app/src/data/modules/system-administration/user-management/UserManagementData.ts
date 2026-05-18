export type UserStatus = "Active" | "Inactive";

export type UserManagementRecord = {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  userTypeId: string;
  userGroupId: string;
  status: UserStatus;
};

export type UserTypeRecord = {
  id: string;
  name: string;
  description: string;
  accessRoles: string[];
  status: UserStatus;
};

export type UserGroupRecord = {
  id: string;
  name: string;
  description: string;
  accessRoles: string[];
  status: UserStatus;
};

export type UserFormValues = Omit<UserManagementRecord, "id">;

export type UserTypeFormValues = Omit<UserTypeRecord, "id">;

export type UserGroupFormValues = Omit<UserGroupRecord, "id">;

export const UserAccessRoleOptions = [
  { value: "dashboard", label: "Dashboard" },
  { value: "branch.management", label: "Branch Management" },
  { value: "maintenance.users", label: "Users" },
  { value: "maintenance.approval", label: "Approval" },
  { value: "maintenance.audit", label: "Audit Trail" },
  { value: "maintenance.mail", label: "Mail Maintenance" },
  { value: "settings.permissions", label: "Permissions" },
  { value: "reports.accounting", label: "Accounting Reports" },
  { value: "reports.inventory", label: "Inventory Reports" },
] as const;

export const InitialUserFormValues: UserFormValues = {
  name: "",
  email: "",
  contactNumber: "",
  userTypeId: "user-type-admin",
  userGroupId: "user-group-operations",
  status: "Active",
};

export const InitialUserTypeFormValues: UserTypeFormValues = {
  name: "",
  description: "",
  accessRoles: ["dashboard"],
  status: "Active",
};

export const InitialUserGroupFormValues: UserGroupFormValues = {
  name: "",
  description: "",
  accessRoles: ["dashboard"],
  status: "Active",
};

export const InitialUsers: UserManagementRecord[] = [
  {
    id: "user-list-001",
    name: "John Dela Cruz",
    email: "john.delacruz@gr8books.test",
    contactNumber: "+63 916 460 4120",
    userTypeId: "user-type-admin",
    userGroupId: "user-group-operations",
    status: "Active",
  },
  {
    id: "user-list-002",
    name: "Maria Santos",
    email: "maria.santos@gr8books.test",
    contactNumber: "+63 917 120 3301",
    userTypeId: "user-type-encoder",
    userGroupId: "user-group-finance",
    status: "Active",
  },
];

export const InitialUserTypes: UserTypeRecord[] = [
  {
    id: "user-type-admin",
    name: "Operations Admin",
    description: "Can maintain core operations and administration records.",
    accessRoles: ["dashboard", "maintenance.users", "branch.management"],
    status: "Active",
  },
  {
    id: "user-type-encoder",
    name: "Encoder",
    description: "Can encode daily transactions and review assigned reports.",
    accessRoles: ["dashboard", "reports.accounting"],
    status: "Active",
  },
];

export const InitialUserGroups: UserGroupRecord[] = [
  {
    id: "user-group-operations",
    name: "Operations",
    description: "Operations team access for company management workflows.",
    accessRoles: ["dashboard", "branch.management", "maintenance.users"],
    status: "Active",
  },
  {
    id: "user-group-finance",
    name: "Finance",
    description: "Finance team access for accounting and reporting workflows.",
    accessRoles: ["dashboard", "reports.accounting"],
    status: "Active",
  },
];

export function createUserRecord(values: UserFormValues): UserManagementRecord {
  return {
    id: `user-list-${Date.now()}`,
    ...trimUserValues(values),
  };
}

export function updateUserRecord(
  user: UserManagementRecord,
  values: UserFormValues,
): UserManagementRecord {
  return {
    ...user,
    ...trimUserValues(values),
  };
}

export function createUserTypeRecord(
  values: UserTypeFormValues,
): UserTypeRecord {
  return {
    id: `user-type-${Date.now()}`,
    ...trimAccessRecordValues(values),
  };
}

export function updateUserTypeRecord(
  userType: UserTypeRecord,
  values: UserTypeFormValues,
): UserTypeRecord {
  return {
    ...userType,
    ...trimAccessRecordValues(values),
  };
}

export function createUserGroupRecord(
  values: UserGroupFormValues,
): UserGroupRecord {
  return {
    id: `user-group-${Date.now()}`,
    ...trimAccessRecordValues(values),
  };
}

export function updateUserGroupRecord(
  userGroup: UserGroupRecord,
  values: UserGroupFormValues,
): UserGroupRecord {
  return {
    ...userGroup,
    ...trimAccessRecordValues(values),
  };
}

function trimUserValues(values: UserFormValues): UserFormValues {
  return {
    ...values,
    name: values.name.trim(),
    email: values.email.trim(),
    contactNumber: values.contactNumber.trim(),
  };
}

function trimAccessRecordValues<
  TValues extends UserTypeFormValues | UserGroupFormValues,
>(values: TValues): TValues {
  return {
    ...values,
    name: values.name.trim(),
    description: values.description.trim(),
  };
}
