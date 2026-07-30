export const ApprovalManagementQueryKeys = {
	all: ["approval-management"] as const,
	modules: () => [...ApprovalManagementQueryKeys.all, "modules"] as const,
	workflows: () => [...ApprovalManagementQueryKeys.all, "workflows"] as const,
};
