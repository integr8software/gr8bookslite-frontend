import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DefaultLookupStaleTime } from "@/app/src/constants/shared/query/QueryKeyConstants";
import { fetchTermLookupOptions } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsLookupApi";
import { TermsMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceQueryKeys";
import type {
  TermLookupOption,
  TermLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsLookupTypes";

export function useTermLookup(
  query: TermLookupQuery = {},
  options?: Omit<UseQueryOptions<TermLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: TermsMaintenanceQueryKeys.lookups(query),
    queryFn: () => fetchTermLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}
