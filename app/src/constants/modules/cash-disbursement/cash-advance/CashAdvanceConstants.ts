import type { VisibilityState } from "@tanstack/react-table";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

export const CashAdvanceHref = getModuleRoute("CA");

export const CashAdvanceStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  posted: "Posted",
} as const;

export const CashAdvanceStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: CashAdvanceStatuses.draft, value: CashAdvanceStatuses.draft },
  {
    label: CashAdvanceStatuses.forApproval,
    value: CashAdvanceStatuses.forApproval,
  },
  { label: CashAdvanceStatuses.posted, value: CashAdvanceStatuses.posted },
  {
    label: CashAdvanceStatuses.disapproved,
    value: CashAdvanceStatuses.disapproved,
  },
  {
    label: CashAdvanceStatuses.cancelled,
    value: CashAdvanceStatuses.cancelled,
  },
] as const;

export const CashAdvanceStatusFilters = [
  "all",
  CashAdvanceStatuses.draft,
  CashAdvanceStatuses.forApproval,
  CashAdvanceStatuses.posted,
  CashAdvanceStatuses.disapproved,
  CashAdvanceStatuses.cancelled,
] as const;

export const CashAdvanceTablePaginationStorageKey =
  "cash-disbursement-cash-advance";

export const CashAdvanceDefaultColumnVisibility: VisibilityState = {
  accountCode: false,
  createdAt: false,
  createdBy: false,
  currency: false,
  partyCode: false,
  updatedAt: false,
  updatedBy: false,
};

export function getCashAdvanceTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 13) return "min-w-[150rem]";
  if (visibleColumnCount >= 10) return "min-w-[122rem]";
  return "min-w-[86rem]";
}

export const CashAdvanceAccountOptions = [
  { label: "Select Account", value: "" },
  { label: "Cash Advance", value: "1130-CA" },
  { label: "Employee Advance", value: "1130-EA" },
  { label: "Officer Advance", value: "1135-OA" },
] as const;

export const CashAdvanceCostCenterOptions = [
  { label: "Select Cost Center", value: "" },
  { label: "Operations", value: "Operations" },
  { label: "Admin", value: "Admin" },
  { label: "Sales", value: "Sales" },
] as const;

export function canEditCashAdvanceStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceStatuses.draft || status === CashAdvanceStatuses.forApproval;
}

export function canApproveCashAdvanceStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceStatuses.forApproval || status === CashAdvanceStatuses.posted;
}

export function canDisapproveCashAdvanceStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceStatuses.forApproval || status === CashAdvanceStatuses.disapproved;
}

export function canCancelCashAdvanceStatus(status: CashAdvanceStatus) {
  return (
    status === CashAdvanceStatuses.draft ||
    status === CashAdvanceStatuses.forApproval ||
    status === CashAdvanceStatuses.cancelled
  );
}

export function getCashAdvanceStatusDialogCopy(status: CashAdvanceStatus, recordLabel: string) {
  if (status === CashAdvanceStatuses.posted) {
    return {
      confirmLabel: "Approve Cash Advance",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve cash advance?",
      tone: "success" as const,
    };
  }

  if (status === CashAdvanceStatuses.disapproved) {
    return {
      confirmLabel: "Disapprove Cash Advance",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove cash advance?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark as Cancelled",
    description: `This will mark ${recordLabel} as Cancelled.`,
    iconTone: "cancel" as const,
    pendingLabel: "Cancelling...",
    title: "Make Cash Advance as Cancelled",
    tone: "danger" as const,
  };
}
