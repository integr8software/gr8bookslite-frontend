import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DefaultLookupStaleTime } from "@/app/src/constants/shared/query/QueryKeyConstants";
import {
  fetchCustomerLookupOptions,
  fetchEmployeeLookupOptions,
  fetchPartyLookupOptions,
  fetchVendorLookupOptions,
} from "@/app/src/services/modules/party-management/PartyLookupApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import type { PartyLookupOption, PartyLookupQuery } from "@/app/src/types/modules/party-management/PartyLookupTypes";

export function usePartyLookup(
  query: PartyLookupQuery = { detail: "complete" },
  options?: Omit<UseQueryOptions<PartyLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: PartyManagementQueryKeys.lookups(query),
    queryFn: () => fetchPartyLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}

export function useVendorLookup(
  query: Omit<PartyLookupQuery, "partyType"> = {},
  options?: Omit<UseQueryOptions<PartyLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: PartyManagementQueryKeys.lookups({ ...query, partyType: "VENDOR" }),
    queryFn: () => fetchVendorLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}

export function useCustomerLookup(
  query: Omit<PartyLookupQuery, "partyType"> = {},
  options?: Omit<UseQueryOptions<PartyLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: PartyManagementQueryKeys.lookups({ ...query, partyType: "CUSTOMER" }),
    queryFn: () => fetchCustomerLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}

export function useEmployeeLookup(
  query: Omit<PartyLookupQuery, "partyType"> = {},
  options?: Omit<UseQueryOptions<PartyLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: PartyManagementQueryKeys.lookups({ ...query, partyType: "EMPLOYEE" }),
    queryFn: () => fetchEmployeeLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}
