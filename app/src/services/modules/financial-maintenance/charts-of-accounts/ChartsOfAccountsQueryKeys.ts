export const ChartsOfAccountsQueryKeys = {
  tree: (companyId?: number | null) =>
    ["maintenance", "financial-management", "charts-of-accounts", companyId ?? "no-company", "tree"] as const,
};
