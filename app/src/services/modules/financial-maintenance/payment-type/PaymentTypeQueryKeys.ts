import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";
import type { PaymentTypeListParams } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";

export const PaymentTypeQueryKeys = {
  all: () => ["paymentType"] as const,
  paymentTypes: (params?: PaymentTypeListParams) =>
    [...PaymentTypeQueryKeys.all(), "paymentTypes", params ?? {}] as const,
  lookups: (query?: unknown) => [...PaymentTypeQueryKeys.all(), QueryLookupScope, query ?? "all"] as const,
};
