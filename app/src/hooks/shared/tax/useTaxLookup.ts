import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DefaultLookupStaleTime, QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";
import { TaxQueryKeys } from "@/app/src/services/shared/tax/TaxApi";
import {
  fetchPurchaseTaxLookupOptions,
  fetchSalesTaxLookupOptions,
  fetchTaxLookupOptions,
} from "@/app/src/services/shared/tax/TaxLookupApi";
import type { TaxListQuery, TaxLookupOption } from "@/app/src/types/shared/tax/TaxTypes";

export function useTaxLookup(
  query: TaxListQuery = {},
  options?: Omit<UseQueryOptions<TaxLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...TaxQueryKeys.list(query), QueryLookupScope],
    queryFn: () => fetchTaxLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}

export function usePurchaseTaxLookup(
  query: Omit<TaxListQuery, "transactionType"> = {},
  options?: Omit<UseQueryOptions<TaxLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...TaxQueryKeys.list({ ...query, transactionType: "PURCHASE" }), QueryLookupScope],
    queryFn: () => fetchPurchaseTaxLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}

export function useSalesTaxLookup(
  query: Omit<TaxListQuery, "transactionType"> = {},
  options?: Omit<UseQueryOptions<TaxLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...TaxQueryKeys.list({ ...query, transactionType: "SALES" }), QueryLookupScope],
    queryFn: () => fetchSalesTaxLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}
