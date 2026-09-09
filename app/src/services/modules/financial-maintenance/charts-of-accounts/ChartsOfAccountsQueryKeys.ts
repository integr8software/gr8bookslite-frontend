import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";

const ChartsOfAccountsScope = ["maintenance", "financial-management", "charts-of-accounts"] as const;

export const ChartsOfAccountsQueryKeys = {
  all: (companyId?: number | null) => [...ChartsOfAccountsScope, companyId ?? "no-company"] as const,
  tree: (companyId?: number | null) => [...ChartsOfAccountsQueryKeys.all(companyId), "tree"] as const,
  nextAccountCode: (companyId?: number | null, parentAccountId?: string | null, accountLevel?: string) =>
    [...ChartsOfAccountsQueryKeys.all(companyId), "next-code", parentAccountId, accountLevel] as const,
  postingAccounts: (query?: unknown) => [...ChartsOfAccountsScope, QueryLookupScope, "posting", query ?? "all"] as const,
  allAccounts: (query?: unknown) => [...ChartsOfAccountsScope, QueryLookupScope, "all-accounts", query ?? "all"] as const,
};
