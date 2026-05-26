export const MasterPlanAndPackageQueryKeys = {
	all: ["master-plan-and-packages"] as const,
	lists: () => [...MasterPlanAndPackageQueryKeys.all, "list"] as const,
	details: (recordId: string) =>
		[...MasterPlanAndPackageQueryKeys.all, "detail", recordId] as const,
};
