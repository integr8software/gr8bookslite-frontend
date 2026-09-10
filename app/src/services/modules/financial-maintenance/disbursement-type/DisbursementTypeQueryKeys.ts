import type { DisbursementTypeMaintenanceKind } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";

export const DisbursementTypeQueryKeys = {
  all: (companyId?: number | null, kind: DisbursementTypeMaintenanceKind = "disbursement") =>
    ["disbursement-type", kind, companyId ?? "no-company"] as const,
  list: (companyId?: number | null, kind: DisbursementTypeMaintenanceKind = "disbursement") =>
    [...DisbursementTypeQueryKeys.all(companyId, kind), "list"] as const,
  accountOptions: (companyId?: number | null, kind: DisbursementTypeMaintenanceKind = "disbursement") =>
    [...DisbursementTypeQueryKeys.all(companyId, kind), "account-options"] as const,
  expenseParentOptions: (companyId?: number | null, kind: DisbursementTypeMaintenanceKind = "disbursement") =>
    [...DisbursementTypeQueryKeys.all(companyId, kind), "expense-parent-options"] as const,
};
