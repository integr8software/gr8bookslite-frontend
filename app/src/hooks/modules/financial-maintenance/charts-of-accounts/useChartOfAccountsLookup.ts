import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DefaultLookupStaleTime } from "@/app/src/constants/shared/query/QueryKeyConstants";
import {
  fetchAllAccountLookupOptions,
  fetchPostingAccountLookupOptions,
} from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import type {
  ChartOfAccountsLookupOption,
  ChartOfAccountsLookupQuery,
  PostingAccountLookupOption,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupTypes";

export function usePostingAccountLookup(
  query: ChartOfAccountsLookupQuery = {},
  options?: Omit<UseQueryOptions<PostingAccountLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ChartsOfAccountsQueryKeys.postingAccounts(query),
    queryFn: () => fetchPostingAccountLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}

export function useAllAccountLookup(
  query: ChartOfAccountsLookupQuery = {},
  options?: Omit<UseQueryOptions<ChartOfAccountsLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ChartsOfAccountsQueryKeys.allAccounts(query),
    queryFn: () => fetchAllAccountLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}
