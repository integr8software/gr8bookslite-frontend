export const PostDatedCheckQueryKeys = {
  all: ["post-dated-check"] as const,
  list: (companyId?: number | null, branchId?: number | null) => ["post-dated-check", "list", companyId, branchId] as const,
  detail: (id: string, companyId?: number | null, branchId?: number | null) =>
    ["post-dated-check", "detail", id, companyId, branchId] as const,
  parties: (companyId?: number | null) => ["post-dated-check", "parties", companyId] as const,
};
