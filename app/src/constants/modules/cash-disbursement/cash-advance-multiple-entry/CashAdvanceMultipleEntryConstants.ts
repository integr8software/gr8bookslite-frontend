import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceCostCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import type { ColumnOrderState, VisibilityState } from "@tanstack/react-table";
import type {
  CashAdvanceMultipleEntryDetailsTab,
  CashAdvanceMultipleEntrySubmitConfirmationAction,
  CashAdvanceMultipleEntryTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

export const CashAdvanceMultipleEntryLink = getModuleRoute("CAME");
export const CashAdvanceMultipleEntryAddLink = `${CashAdvanceMultipleEntryLink}/add`;
export const getCashAdvanceMultipleEntryEditLink = (recordId: string) => `${CashAdvanceMultipleEntryLink}/edit/${recordId}`;
export const getCashAdvanceMultipleEntryViewLink = (recordId: string) => `${CashAdvanceMultipleEntryLink}/view/${recordId}`;
export const CashAdvanceMultipleEntryStorageKey = "gr8books.cash-advance-multiple-entry.records";
export const CashAdvanceMultipleEntryTransactionNumberPrefix = "CAME-";
export const CashAdvanceMultipleEntryTransactionNumberPadding = 6;

export const CashAdvanceMultipleEntryTablePaginationStorageKey = "cash-disbursement-cash-advance-multiple-entry";

export const CashAdvanceMultipleEntryOverviewColumnWidths = {
  ...TransactionOverviewColumnWidths,
  partyName: 300,
  accountTitle: 230,
  actions: TransactionOverviewColumnWidths.actions,
} as const;

export const CashAdvanceMultipleEntryStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;

export const CashAdvanceMultipleEntrySubmitConfirmationDialogTitles: Record<
  CashAdvanceMultipleEntrySubmitConfirmationAction,
  string
> = {
  save: "Save Cash Advance Multiple Entry?",
  draft: "Save Cash Advance Multiple Entry as Draft?",
};

export const CashAdvanceMultipleEntrySubmitConfirmationDialogConfirmLabels: Record<
  CashAdvanceMultipleEntrySubmitConfirmationAction,
  string
> = {
  save: "Save and Submit",
  draft: "Save as Draft",
};

export function getCashAdvanceMultipleEntryStatusDialogCopy(
  status: CashAdvanceStatus,
  recordLabel: string,
  currentStatus?: CashAdvanceStatus,
) {
  if (status === CashAdvanceMultipleEntryStatuses.forApproval && currentStatus === CashAdvanceMultipleEntryStatuses.posted) {
    return {
      confirmLabel: "Undo Approved",
      description: `This will undo the approval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Approval...",
      title: "Undo Approved Cash Advance Multiple Entry?",
      tone: "question" as const,
    };
  }

  if (
    status === CashAdvanceMultipleEntryStatuses.forApproval &&
    currentStatus === CashAdvanceMultipleEntryStatuses.disapproved
  ) {
    return {
      confirmLabel: "Undo Disapproved",
      description: `This will undo the disapproval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Disapproval...",
      title: "Undo Disapproved Cash Advance Multiple Entry?",
      tone: "question" as const,
    };
  }

  if (currentStatus === CashAdvanceMultipleEntryStatuses.cancelled) {
    return {
      confirmLabel: "Undo Cancelled",
      description: `This will undo the cancellation of ${recordLabel}.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Cancellation...",
      title: "Undo Cancelled Cash Advance Multiple Entry?",
      tone: "question" as const,
    };
  }

  if (status === CashAdvanceMultipleEntryStatuses.posted) {
    return {
      confirmLabel: "Approve Entry",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Cash Advance Multiple Entry?",
      tone: "success" as const,
    };
  }

  if (status === CashAdvanceMultipleEntryStatuses.disapproved) {
    return {
      confirmLabel: "Disapprove Entry",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove Cash Advance Multiple Entry?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark as Cancelled",
    description: `This will mark ${recordLabel} as Cancelled.`,
    iconTone: "cancel" as const,
    pendingLabel: "Cancelling...",
    title: "Make Cash Advance Multiple Entry as Cancelled",
    tone: "warning" as const,
  };
}

export const CashAdvanceMultipleEntryAllStatusFilter = "all";

export const CashAdvanceMultipleEntryDefaultColumnVisibility: VisibilityState = {
  accountCode: false,
  createdAt: false,
  createdBy: false,
  partyCode: false,
  remarks: false,
  updatedAt: false,
  updatedBy: false,
};

export const CashAdvanceMultipleEntryDefaultColumnOrder: ColumnOrderState = [
  "transNo",
  "documentDate",
  "partyCode",
  "partyName",
  "accountCode",
  "accountTitle",
  "amount",
  "remarks",
  "createdBy",
  "createdAt",
  "updatedBy",
  "updatedAt",
  "status",
  "actions",
];

export const CashAdvanceMultipleEntryStatusFilterOptions = [
  { label: "All statuses", value: CashAdvanceMultipleEntryAllStatusFilter },
  { label: CashAdvanceMultipleEntryStatuses.posted, value: CashAdvanceMultipleEntryStatuses.posted },
  {
    label: CashAdvanceMultipleEntryStatuses.forApproval,
    value: CashAdvanceMultipleEntryStatuses.forApproval,
  },
  {
    label: CashAdvanceMultipleEntryStatuses.draft,
    value: CashAdvanceMultipleEntryStatuses.draft,
  },
  {
    label: CashAdvanceMultipleEntryStatuses.disapproved,
    value: CashAdvanceMultipleEntryStatuses.disapproved,
  },
  {
    label: CashAdvanceMultipleEntryStatuses.cancelled,
    value: CashAdvanceMultipleEntryStatuses.cancelled,
  },
] as const;

export const CashAdvanceMultipleEntryStatusFilters = [
  CashAdvanceMultipleEntryAllStatusFilter,
  CashAdvanceMultipleEntryStatuses.posted,
  CashAdvanceMultipleEntryStatuses.forApproval,
  CashAdvanceMultipleEntryStatuses.draft,
  CashAdvanceMultipleEntryStatuses.disapproved,
  CashAdvanceMultipleEntryStatuses.cancelled,
] as const;

export const CashAdvanceMultipleEntryDetailsTabs: {
  id: CashAdvanceMultipleEntryDetailsTab;
  label: string;
}[] = [
  { id: "details", label: "Cash Advance Details" },
  { id: "attachment", label: "File Attachments" },
];

export const CashAdvanceMultipleEntryEntryTabs: {
  id: CashAdvanceMultipleEntryTab;
  label: string;
}[] = [
  { id: "items", label: "Item Details" },
  { id: "accounting", label: "Accounting Entries" },
];

export const CashAdvanceMultipleEntryItemColumnOrder = [
  "partyCode",
  "partyName",
  "amount",
  "cashAdvanceLimit",
  "totalCashAdvanced",
  "cashAdvanceBalance",
  "responsibilityCenterCode",
  "responsibilityCenter",
  "particulars",
];

export const CashAdvanceMultipleEntryItemColumnLabels: Record<string, string> = {
  partyCode: "Party Code",
  partyName: "Party Name",
  amount: "Cash Advance Amount",
  cashAdvanceLimit: "Cash Advance Limit",
  totalCashAdvanced: "Total Cash Advances",
  cashAdvanceBalance: "Available Cash Advance",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenter: "Responsibility Center",
  particulars: "Particulars",
};

export const CashAdvanceMultipleEntryItemColumnWidths: Record<string, number> = {
  partyCode: 125,
  partyName: 220,
  amount: 140,
  cashAdvanceLimit: 155,
  totalCashAdvanced: 165,
  cashAdvanceBalance: 155,
  responsibilityCenterCode: 155,
  responsibilityCenter: 165,
  particulars: 300,
};

export const CashAdvanceMultipleEntryDetailTablePreferencesStorageKey =
  "gr8books:cash-advance-multiple-entry:detail-table-preferences";

export const CashAdvanceMultipleEntryDefaultItemColumnIds = [
  "partyName",
  "amount",
  "cashAdvanceLimit",
  "totalCashAdvanced",
  "cashAdvanceBalance",
];

export const CashAdvanceMultipleEntryProtectedItemColumnIds = new Set(["partyName", "amount"]);

export const CashAdvanceMultipleEntryDefaultAccountingColumnIds = ["accountTitle", "credit", "debit", "partyName"];

export const CashAdvanceMultipleEntryFieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

export const CashAdvanceMultipleEntryReadOnlyFieldClassName =
  "app-data-entry-field transaction-readonly-placeholder h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-darknavy/5 px-3 text-sm font-medium text-darknavy/60 outline-none placeholder:text-darknavy/35";

export const CashAdvanceMultipleEntryEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 read-only:text-darknavy focus:ring-2 focus:ring-inset focus:ring-skyblue/35";

export const CashAdvanceMultipleEntryEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export function getCashAdvanceMultipleEntryTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 13) return "min-w-[158rem]";
  if (visibleColumnCount >= 10) return "min-w-[126rem]";
  return "min-w-[82rem]";
}

export {
  CashAdvanceAccountOptions as CashAdvanceMultipleEntryAccountOptions,
  CashAdvanceCostCenterOptions as CashAdvanceMultipleEntryCostCenterOptions,
};
