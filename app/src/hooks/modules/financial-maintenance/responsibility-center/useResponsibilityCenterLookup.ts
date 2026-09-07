import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DefaultLookupStaleTime } from "@/app/src/constants/shared/query/QueryKeyConstants";
import {
  fetchResponsibilityCenterLookupOptions,
  fetchResponsibilityCenterLookupOptionsByType,
} from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterLookupApi";
import { ResponsibilityCenterQueryKeys } from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterQueryKeys";
import type {
  ResponsibilityCenterLookupOption,
  ResponsibilityCenterLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterLookupTypes";

export function useResponsibilityCenterLookup(
  query: ResponsibilityCenterLookupQuery = {},
  options?: Omit<UseQueryOptions<ResponsibilityCenterLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ResponsibilityCenterQueryKeys.lookups(query),
    queryFn: () => fetchResponsibilityCenterLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}

export function useResponsibilityCenterLookupByType(
  typeId: string,
  query: Omit<ResponsibilityCenterLookupQuery, "typeId"> = {},
  options?: Omit<UseQueryOptions<ResponsibilityCenterLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ResponsibilityCenterQueryKeys.lookups({ ...query, typeId }),
    queryFn: () => fetchResponsibilityCenterLookupOptionsByType(typeId, query),
    staleTime: DefaultLookupStaleTime,
    enabled: Boolean(typeId),
    ...options,
  });
}
