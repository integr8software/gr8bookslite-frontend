import { useCashVoucherControllerGetDefaultAccountsV1 } from "@/app/src/generated/api/cash-voucher/cash-voucher";
import type { CashVoucherDefaultAccountsResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { DefaultLookupStaleTime } from "@/app/src/constants/shared/query/QueryKeyConstants";

export function useCashVoucherDefaultAccounts() {
  return useCashVoucherControllerGetDefaultAccountsV1({
    query: {
      staleTime: DefaultLookupStaleTime,
    },
  });
}

export type { CashVoucherDefaultAccountsResponseDto };
