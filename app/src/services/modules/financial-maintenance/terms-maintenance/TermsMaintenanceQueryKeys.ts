import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";

export const TermsMaintenanceQueryKeys = {
  all: () => ["termManagement"] as const,
  terms: () => [...TermsMaintenanceQueryKeys.all(), "terms"] as const,
  options: () => [...TermsMaintenanceQueryKeys.all(), "options"] as const,
  lookups: (query?: unknown) => [...TermsMaintenanceQueryKeys.all(), QueryLookupScope, query ?? "all"] as const,
};
