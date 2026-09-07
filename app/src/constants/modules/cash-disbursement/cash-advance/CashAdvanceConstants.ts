import type { ColumnOrderState, SortingState, VisibilityState } from "@tanstack/react-table";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  CashAdvanceActionMode,
  CashAdvanceDetailsSection,
  CashAdvanceStatus,
  CashAdvanceSubmitConfirmationAction,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

export const CashAdvanceLink = getModuleRoute("CA");
export const CashAdvanceAddLink = `${CashAdvanceLink}/add`;
export const getCashAdvanceEditLink = (recordId: string) => `${CashAdvanceLink}/edit/${recordId}`;
export const getCashAdvanceViewLink = (recordId: string) => `${CashAdvanceLink}/view/${recordId}`;

export const CashAdvanceActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, CashAdvanceActionMode>;

export const CashAdvanceTabs = [
  { id: "advance", label: "Cash Advance Details" },
  { id: "attachment", label: "File Attachments" },
] satisfies ModuleTabItem<CashAdvanceDetailsSection>[];

export const CashAdvanceStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, CashAdvanceStatus>;

export const CashAdvanceSubmitConfirmationDialogTitles: Record<CashAdvanceSubmitConfirmationAction, string> = {
  save: "Save Cash Advance?",
  draft: "Save Cash Advance as Draft?",
};

export const CashAdvanceSubmitConfirmationDialogConfirmLabels: Record<CashAdvanceSubmitConfirmationAction, string> = {
  save: "Save and Submit",
  draft: "Save as Draft",
};

export const CashAdvanceAllStatusFilter = "all";

export const EditableCashAdvanceStatuses: readonly CashAdvanceStatus[] = [CashAdvanceStatuses.Draft];

export const CashAdvanceStatusFilterOptions = [
  { label: "All statuses", value: CashAdvanceAllStatusFilter },
  { label: "Draft", value: CashAdvanceStatuses.Draft },
  {
    label: "For Approval",
    value: CashAdvanceStatuses.ForApproval,
  },
  { label: "Posted", value: CashAdvanceStatuses.Posted },
  {
    label: "Disapproved",
    value: CashAdvanceStatuses.Disapproved,
  },
  {
    label: "Cancelled",
    value: CashAdvanceStatuses.Cancelled,
  },
] as const;

export const CashAdvanceRecordStatuses = [
  CashAdvanceStatuses.Draft,
  CashAdvanceStatuses.ForApproval,
  CashAdvanceStatuses.Posted,
  CashAdvanceStatuses.Disapproved,
  CashAdvanceStatuses.Cancelled,
] as const satisfies readonly CashAdvanceStatus[];

export const CashAdvanceStatusFilters = [
  CashAdvanceAllStatusFilter,
  ...CashAdvanceRecordStatuses,
] as const;

export const CashAdvanceTablePaginationStorageKey = "cash-disbursement-cash-advance";
export const CashAdvanceTablePreferencesModuleKey = "cash-disbursement:cash-advance";
export const CashAdvanceTablePreferencesStorageKey = "cash-disbursement:cash-advance:table-preferences";

export const CashAdvanceOverviewColumnWidths = {
  ...TransactionOverviewColumnWidths,
  partyName: 220,
} as const;

export const CashAdvanceDefaultColumnOrder: ColumnOrderState = [
  "transNo",
  "documentDate",
  "partyCode",
  "partyName",
  "accountCode",
  "accountTitle",
  "currency",
  "fxRate",
  "amount",
  "remarks",
  "createdBy",
  "createdAt",
  "updatedBy",
  "updatedAt",
  "status",
  "actions",
];

export const CashAdvanceDefaultColumnVisibility: VisibilityState = {
  accountCode: false,
  createdAt: false,
  createdBy: false,
  currency: false,
  fxRate: false,
  partyCode: false,
  remarks: false,
  updatedAt: false,
  updatedBy: false,
};

export const CashAdvanceDefaultSorting: SortingState = [{ id: "createdAt", desc: true }];

export function canEditCashAdvanceStatus(status: CashAdvanceStatus) {
  return EditableCashAdvanceStatuses.includes(status);
}

export function canApproveCashAdvanceStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceStatuses.ForApproval || status === CashAdvanceStatuses.Posted;
}

export function canDisapproveCashAdvanceStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceStatuses.ForApproval || status === CashAdvanceStatuses.Disapproved;
}

export function canCancelCashAdvanceStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceStatuses.Draft || status === CashAdvanceStatuses.ForApproval || status === CashAdvanceStatuses.Cancelled;
}

export function getCashAdvanceStatusDialogCopy(status: CashAdvanceStatus, recordLabel: string, currentStatus?: CashAdvanceStatus) {
  if (status === CashAdvanceStatuses.ForApproval && currentStatus === CashAdvanceStatuses.Posted) {
    return {
      confirmLabel: "Undo Approved",
      description: `This will undo the approval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Approval...",
      title: "Undo Approved Cash Advance?",
      tone: "question" as const,
    };
  }

  if (status === CashAdvanceStatuses.ForApproval && currentStatus === CashAdvanceStatuses.Disapproved) {
    return {
      confirmLabel: "Undo Disapproved",
      description: `This will undo the disapproval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Disapproval...",
      title: "Undo Disapproved Cash Advance?",
      tone: "question" as const,
    };
  }

  if (currentStatus === CashAdvanceStatuses.Cancelled) {
    return {
      confirmLabel: "Undo Cancelled",
      description: `This will undo the cancellation of ${recordLabel}.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Cancellation...",
      title: "Undo Cancelled Cash Advance?",
      tone: "question" as const,
    };
  }

  if (status === CashAdvanceStatuses.Posted) {
    return {
      confirmLabel: "Approve Cash Advance",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Cash Advance?",
      tone: "success" as const,
    };
  }

  if (status === CashAdvanceStatuses.Disapproved) {
    return {
      confirmLabel: "Disapprove Cash Advance",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove Cash Advance?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark as Cancelled",
    description: `This will mark ${recordLabel} as Cancelled.`,
    iconTone: "cancel" as const,
    pendingLabel: "Cancelling...",
    title: "Make Cash Advance as Cancelled",
    tone: "warning" as const,
  };
}
