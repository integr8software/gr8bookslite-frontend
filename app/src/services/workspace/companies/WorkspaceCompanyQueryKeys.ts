export const WorkspaceCompanyQueryKeys = {
	branches: () => ["workspace-companies", "branches"] as const,
	companyBranches: (companyId: string) =>
		["workspace-companies", "company", companyId, "branches"] as const,
	companies: () => ["workspace-companies", "companies"] as const,
	company: (companyId: string) =>
		["workspace-companies", "company", companyId] as const,
	managementSummaries: () =>
		["workspace-companies", "management-summary"] as const,
	managementSummary: (includeUsers: boolean) =>
		[
			...WorkspaceCompanyQueryKeys.managementSummaries(),
			includeUsers ? "with-users" : "companies-only",
		] as const,
	users: () => ["workspace-companies", "users"] as const,
};
