export const WorkspaceCompanyQueryKeys = {
	branches: () => ["workspace-companies", "branches"] as const,
	companies: () => ["workspace-companies", "companies"] as const,
	company: (companyId: string) =>
		["workspace-companies", "company", companyId] as const,
	users: () => ["workspace-companies", "users"] as const,
};
