import { useMemo } from "react";
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

export function isProjectResponsibilityCenter(option: {
  name?: string | null;
  typeName?: string | null;
  classificationName?: string | null;
  [key: string]: unknown;
}): boolean {
  const text = `${option.typeName ?? ""} ${option.classificationName ?? ""} ${option.name ?? ""}`.toLowerCase();
  return text.includes("project");
}

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

export function useResponsibilityCenterSplitLookup(
  query: ResponsibilityCenterLookupQuery = {},
  options?: Omit<UseQueryOptions<ResponsibilityCenterLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  const lookupQuery = useResponsibilityCenterLookup(query, options);

  const costCenterOptions = useMemo(() => {
    return (lookupQuery.data ?? []).filter((rc) => !isProjectResponsibilityCenter(rc));
  }, [lookupQuery.data]);

  const projectOptions = useMemo(() => {
    const matched = (lookupQuery.data ?? []).filter(isProjectResponsibilityCenter);
    return matched.length > 0 ? matched : (lookupQuery.data ?? []);
  }, [lookupQuery.data]);

  return {
    ...lookupQuery,
    costCenterOptions,
    projectOptions,
  };
}
