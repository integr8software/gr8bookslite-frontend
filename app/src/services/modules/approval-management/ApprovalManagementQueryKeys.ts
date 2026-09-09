export const ApprovalManagementQueryKeys = {
	all: (companyId?: number | null) =>
		["approval-management", companyId ?? "no-company"] as const,
	modules: (companyId?: number | null) =>
		[...ApprovalManagementQueryKeys.all(companyId), "modules"] as const,
	transactions: (companyId?: number | null) =>
		[...ApprovalManagementQueryKeys.all(companyId), "transactions"] as const,
	workflows: (companyId?: number | null) =>
		[...ApprovalManagementQueryKeys.all(companyId), "workflows"] as const,
};
