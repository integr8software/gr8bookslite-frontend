export const ApprovalManagementQueryKeys = {
	all: ["approval-management"] as const,
	modules: () => [...ApprovalManagementQueryKeys.all, "modules"] as const,
	transactions: () => [...ApprovalManagementQueryKeys.all, "transactions"] as const,
	workflows: () => [...ApprovalManagementQueryKeys.all, "workflows"] as const,
};
