export const DefaultAccountQueryKeys = {
	all: (companyId?: number | null) => ["default-account", companyId ?? "no-company"] as const,
	list: (companyId?: number | null) =>
		[...DefaultAccountQueryKeys.all(companyId), "list"] as const,
};
