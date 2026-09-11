import type { CollectionTypeMaintenanceKind } from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";

export const CollectionTypeQueryKeys = {
  all: (companyId?: number | null, kind: CollectionTypeMaintenanceKind = "collection") =>
    ["collection-type", kind, companyId ?? "no-company"] as const,
  list: (companyId?: number | null, kind: CollectionTypeMaintenanceKind = "collection") =>
    [...CollectionTypeQueryKeys.all(companyId, kind), "list"] as const,
  accountOptions: (companyId?: number | null, kind: CollectionTypeMaintenanceKind = "collection") =>
    [...CollectionTypeQueryKeys.all(companyId, kind), "account-options"] as const,
  expenseParentOptions: (companyId?: number | null, kind: CollectionTypeMaintenanceKind = "collection") =>
    [...CollectionTypeQueryKeys.all(companyId, kind), "expense-parent-options"] as const,
};
