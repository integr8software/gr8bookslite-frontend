import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";

export const ResponsibilityCenterQueryKeys = {
  all: () => ["responsibility-center"] as const,
  classifications: () => [...ResponsibilityCenterQueryKeys.all(), "classifications"] as const,
  centers: () => [...ResponsibilityCenterQueryKeys.all(), "centers"] as const,
  types: (classificationId?: string) =>
    [...ResponsibilityCenterQueryKeys.all(), "types", classificationId ?? "all"] as const,
  options: () => [...ResponsibilityCenterQueryKeys.all(), "options"] as const,
  lookups: (query?: unknown) => [...ResponsibilityCenterQueryKeys.all(), QueryLookupScope, query ?? "all"] as const,
};
