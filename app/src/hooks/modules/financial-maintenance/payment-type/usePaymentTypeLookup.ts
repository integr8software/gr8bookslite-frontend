import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DefaultLookupStaleTime } from "@/app/src/constants/shared/query/QueryKeyConstants";
import { fetchPaymentTypeLookupOptions } from "@/app/src/services/modules/financial-maintenance/payment-type/PaymentTypeLookupApi";
import { PaymentTypeQueryKeys } from "@/app/src/services/modules/financial-maintenance/payment-type/PaymentTypeQueryKeys";
import type {
  PaymentTypeLookupOption,
  PaymentTypeLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeLookupTypes";

export function usePaymentTypeLookup(
  query: PaymentTypeLookupQuery = {},
  options?: Omit<UseQueryOptions<PaymentTypeLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: PaymentTypeQueryKeys.lookups(query),
    queryFn: () => fetchPaymentTypeLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}
