const PostDatedCheckQueryKeyScope = "post-dated-check";

export const PostDatedCheckQueryKeys = {
  all: [PostDatedCheckQueryKeyScope] as const,
  list: (companyId?: number | null, branchId?: number | null) => [PostDatedCheckQueryKeyScope, "list", companyId, branchId] as const,
  detail: (id: string, companyId?: number | null, branchId?: number | null) =>
    [PostDatedCheckQueryKeyScope, "detail", id, companyId, branchId] as const,
  parties: (companyId?: number | null) => [PostDatedCheckQueryKeyScope, "parties", companyId] as const,
};
