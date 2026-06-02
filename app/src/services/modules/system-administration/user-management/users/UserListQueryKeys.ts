export const UserListQueryKeys = {
  branchRoles: (unitId: string) =>
    ["user-management", "branch-users", unitId, "roles"] as const,
  branchUsers: (unitId: string) =>
    ["user-management", "branch-users", unitId, "users"] as const,
  users: () => ["user-management", "users", "users"] as const,
};
