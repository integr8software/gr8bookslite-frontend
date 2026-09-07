import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";

export const BankMasterfileQueryKeys = {
  all: (companyId?: number | null) => ["bank-masterfile", companyId ?? "no-company"] as const,
  banks: (companyId?: number | null) => [...BankMasterfileQueryKeys.all(companyId), "banks"] as const,
  nextAccountCode: (companyId?: number | null) => [...BankMasterfileQueryKeys.all(companyId), "next-account-code"] as const,
  lookups: (query?: unknown) => ["bank-masterfile", QueryLookupScope, query ?? "all"] as const,
};
