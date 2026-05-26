export const ApprovalManagementQueryKeys = {
	all: ["approval-management"] as const,
	workflows: () => [...ApprovalManagementQueryKeys.all, "workflows"] as const,
};
