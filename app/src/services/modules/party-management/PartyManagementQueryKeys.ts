import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";
import type { PartyManagementListQuery } from "@/app/src/types/modules/party-management/PartyManagementTypes";

export const PartyManagementQueryKeys = {
  all: () => ["party-management", "party-information"] as const,
  list: (query: PartyManagementListQuery, recordsVersion: string) =>
    [...PartyManagementQueryKeys.all(), "list", query, recordsVersion] as const,
  records: () => [...PartyManagementQueryKeys.all(), "records"] as const,
  accountingOptions: () => [...PartyManagementQueryKeys.all(), "accounting-options"] as const,
  customerOptions: (consumer: string) => [...PartyManagementQueryKeys.all(), "options", "customer", consumer] as const,
  employeeOptions: (consumer: string) => [...PartyManagementQueryKeys.all(), "options", "employee", consumer] as const,
  cashVoucherPartyOptions: () => ["cash-voucher", "party-options"] as const,
  cashAdvancePartyOptions: () => ["cash-disbursement", "cash-advance", "party-options"] as const,
  lookups: (query?: unknown) => [...PartyManagementQueryKeys.all(), QueryLookupScope, query ?? "all"] as const,
};
