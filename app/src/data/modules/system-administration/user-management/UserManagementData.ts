import {
  InitialUserRoleFormValues as InitialUserRoleFormValuesSource,
  InitialUserRoles,
  UserAccessRoleOptions,
  UserPermissionActions,
  createUserRoleRecord,
  updateUserRoleRecord,
  type UserRoleFormValues as UserRoleFormValuesSource,
  type UserRoleRecord as UserRoleRecordSource,
} from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleData";

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

export type UserRoleRecord = UserRoleRecordSource;

export type UserFormValues = Omit<UserManagementRecord, "id">;

export type UserRoleFormValues = UserRoleFormValuesSource;

export {
  InitialUserRoles,
  UserAccessRoleOptions,
  UserPermissionActions,
  createUserRoleRecord,
  updateUserRoleRecord,
};

export const InitialUserFormValues: UserFormValues = {
  name: "",
  email: "",
  contactNumber: "",
  userRoleId: "user-role-admin",
  status: "Active",
};

export const InitialUserRoleFormValues = InitialUserRoleFormValuesSource;

export const InitialUsers: UserManagementRecord[] = [
  {
    id: "users-001",
    name: "John Dela Cruz",
    email: "john.delacruz@gr8books.test",
    contactNumber: "+63 916 460 4120",
    userRoleId: "user-role-admin",
    status: "Active",
    lastLogin: "May 15, 2026 08:45 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-002",
    name: "Jane Santos",
    email: "jane.santos@gr8books.test",
    contactNumber: "+63 917 120 3301",
    userRoleId: "user-role-encoder",
    status: "Active",
    lastLogin: "May 14, 2026 10:20 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-003",
    name: "Michael Reyes",
    email: "michael.reyes@gr8books.test",
    contactNumber: "+63 919 443 7902",
    userRoleId: "user-role-admin",
    status: "Active",
    lastLogin: "May 15, 2026 10:15 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-004",
    name: "Emily Lim",
    email: "emily.lim@gr8books.test",
    contactNumber: "+63 920 115 8364",
    userRoleId: "user-role-encoder",
    status: "Inactive",
    lastLogin: "May 12, 2026 02:30 PM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-005",
    name: "Daniel Wilson",
    email: "daniel.wilson@gr8books.test",
    contactNumber: "+63 917 884 1209",
    userRoleId: "user-role-manager",
    status: "Pending",
    lastLogin: "May 15, 2026 09:00 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-006",
    name: "Sarah Davis",
    email: "sarah.davis@gr8books.test",
    contactNumber: "+63 921 771 3004",
    userRoleId: "user-role-encoder",
    status: "Pending",
    lastLogin: "May 13, 2026 11:00 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-007",
    name: "David Martinez",
    email: "david.martinez@gr8books.test",
    contactNumber: "+63 922 556 4421",
    userRoleId: "user-role-encoder",
    status: "Inactive",
    lastLogin: "May 8, 2026 09:15 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-008",
    name: "Laura Taylor",
    email: "laura.taylor@gr8books.test",
    contactNumber: "+63 923 661 2105",
    userRoleId: "user-role-manager",
    status: "Active",
    lastLogin: "May 14, 2026 03:40 PM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "users-009",
    name: "Carlo Mendoza",
    email: "carlo.mendoza@gr8books.test",
    contactNumber: "+63 924 716 8830",
    userRoleId: "user-role-auditor",
    status: "Active",
    lastLogin: "May 15, 2026 06:50 AM",
  },
  {
    id: "users-010",
    name: "Alyssa Tan",
    email: "alyssa.tan@gr8books.test",
    contactNumber: "+63 925 613 4208",
    userRoleId: "user-role-encoder",
    status: "Pending",
    lastLogin: "May 15, 2026 07:10 AM",
  },
];

export function createUserRecord(values: UserFormValues): UserManagementRecord {
  return {
    id: `users-${Date.now()}`,
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

export function getNextUserStatus(status: UserStatus): UserStatus {
  return status === "Inactive" ? "Active" : "Inactive";
}

function trimUserValues(values: UserFormValues): UserFormValues {
  return {
    ...values,
    name: values.name.trim(),
    email: values.email.trim(),
    contactNumber: values.contactNumber.trim(),
  };
}
