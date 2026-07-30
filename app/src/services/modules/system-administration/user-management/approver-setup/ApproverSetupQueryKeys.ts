export const ApproverSetupQueryKeys = {
	all: ["approver-setup"] as const,
	modules: () => [...ApproverSetupQueryKeys.all, "modules"] as const,
	records: () => [...ApproverSetupQueryKeys.all, "records"] as const,
	users: () => [...ApproverSetupQueryKeys.all, "users"] as const,
};
