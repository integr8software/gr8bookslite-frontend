export const UserSidebarQueryKeys = {
	all: ["user-sidebar-customization"] as const,
	customization: (
		companyId: number | null,
		branchUnitId: number | null,
		userId: number | undefined,
	) => [...UserSidebarQueryKeys.all, companyId, branchUnitId, userId] as const,
};
