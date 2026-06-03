export const UserRoleQueryKeys = {
	branchRole: (unitId: string, roleId: string) =>
		["user-management", "branch-roles", unitId, "role", roleId] as const,
	branchRoles: (unitId: string) =>
		["user-management", "branch-roles", unitId, "roles"] as const,
};
