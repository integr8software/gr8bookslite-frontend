export const UserListHref = "/system-administration/user-management/users";

export const UserListStatusOptions = ["Active", "Pending", "Inactive"] as const;

export const UserListTablePaginationStorageKey =
  "system-administration-users";

export const UserListTableColumns = [
  { key: "name", label: "Full Name", className: "w-[18rem]" },
  { key: "email", label: "Email", className: "w-[22rem]" },
  { key: "userRole", label: "User Role", className: "w-[12rem]" },
  { key: "department", label: "Department", className: "w-[13rem]" },
  { key: "status", label: "Status", className: "w-[11rem]" },
  { key: "lastLogin", label: "Last Login", className: "w-[16rem]" },
  {
    label: "Actions",
    className: "w-[8rem] text-center",
  },
] as const;
