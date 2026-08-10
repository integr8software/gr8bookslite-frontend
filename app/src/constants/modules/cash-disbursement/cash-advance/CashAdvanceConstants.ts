import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const CashAdvanceHref = getModuleRoute("CA");

export const CashAdvanceStatuses = {
  approved: "Approved",
  cancelled: "Cancelled",
  draft: "Draft",
  pendingReview: "Pending Review",
  rejected: "Rejected",
} as const;

export const CashAdvanceStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: CashAdvanceStatuses.draft },
  {
    label: "For Approval",
    value: CashAdvanceStatuses.pendingReview,
  },
  { label: "Posted", value: CashAdvanceStatuses.approved },
  { label: "Disapproved", value: CashAdvanceStatuses.rejected },
  { label: "Cancelled", value: CashAdvanceStatuses.cancelled },
] as const;

export const CashAdvanceStatusFilters = [
  "all",
  CashAdvanceStatuses.approved,
  CashAdvanceStatuses.cancelled,
  CashAdvanceStatuses.pendingReview,
  CashAdvanceStatuses.draft,
  CashAdvanceStatuses.rejected,
] as const;

export const CashAdvanceTablePaginationStorageKey =
  "cash-disbursement-cash-advance";

export const CashAdvanceAccountOptions = [
  { label: "--Select Account--", value: "" },
  { label: "Cash Advance", value: "1130-CA" },
  { label: "Employee Advance", value: "1130-EA" },
  { label: "Officer Advance", value: "1135-OA" },
] as const;

export const CashAdvanceCostCenterOptions = [
  { label: "--Select Cost Center--", value: "" },
  { label: "Operations", value: "Operations" },
  { label: "Admin", value: "Admin" },
  { label: "Sales", value: "Sales" },
] as const;
