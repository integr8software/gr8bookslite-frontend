import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { DefaultLookupStaleTime } from "@/app/src/constants/shared/query/QueryKeyConstants";
import { fetchBankAccountLookupOptions } from "@/app/src/services/modules/financial-maintenance/bank-masterfile/BankMasterfileLookupApi";
import { BankMasterfileQueryKeys } from "@/app/src/services/modules/financial-maintenance/bank-masterfile/BankMasterfileQueryKeys";
import type {
  BankAccountLookupOption,
  BankAccountLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileLookupTypes";

export function useBankAccountLookup(
  query: BankAccountLookupQuery = {},
  options?: Omit<UseQueryOptions<BankAccountLookupOption[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: BankMasterfileQueryKeys.lookups(query),
    queryFn: () => fetchBankAccountLookupOptions(query),
    staleTime: DefaultLookupStaleTime,
    ...options,
  });
}
