import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import type { ColumnOrderState, VisibilityState } from "@tanstack/react-table";
import type {
  CashAdvanceActionMode,
  CashAdvanceDetailsTab,
  CashAdvanceSubmitConfirmationAction,
  CashAdvanceTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

export const CashAdvanceLink = getModuleRoute("CA");
export const CashAdvanceAddLink = `${CashAdvanceLink}/add`;
export const getCashAdvanceEditLink = (recordId: string) => `${CashAdvanceLink}/edit/${recordId}`;
export const getCashAdvanceViewLink = (recordId: string) => `${CashAdvanceLink}/view/${recordId}`;

export const CashAdvanceActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, CashAdvanceActionMode>;

export const CashAdvanceTablePaginationStorageKey = "cash-disbursement-cash-advance";

export const CashAdvanceOverviewColumnWidths = {
  ...TransactionOverviewColumnWidths,
  partyName: 220,
  accountTitle: 230,
  actions: TransactionOverviewColumnWidths.actions,
} as const;

export const CashAdvanceStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, CashAdvanceStatus>;

export const EditableCashAdvanceStatuses: readonly CashAdvanceStatus[] = [CashAdvanceStatuses.Draft];

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
  return (
    status === CashAdvanceStatuses.Draft ||
    status === CashAdvanceStatuses.ForApproval ||
    status === CashAdvanceStatuses.Cancelled
  );
}

export const CashAdvanceSubmitConfirmationDialogTitles: Record<CashAdvanceSubmitConfirmationAction, string> = {
  save: "Save Cash Advance?",
  draft: "Save Cash Advance as Draft?",
};

export const CashAdvanceSubmitConfirmationDialogConfirmLabels: Record<
  CashAdvanceSubmitConfirmationAction,
  string
> = {
  save: "Save and Submit",
  draft: "Save as Draft",
};

export function getCashAdvanceStatusDialogCopy(
  status: CashAdvanceStatus,
  recordLabel: string,
  currentStatus?: CashAdvanceStatus,
) {
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
      confirmLabel: "Approve Entry",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Cash Advance?",
      tone: "success" as const,
    };
  }

  if (status === CashAdvanceStatuses.Disapproved) {
    return {
      confirmLabel: "Disapprove Entry",
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

export const CashAdvanceAllStatusFilter = "all";

export const CashAdvanceDefaultColumnVisibility: VisibilityState = {
  accountCode: false,
  createdAt: false,
  createdBy: false,
  currency: false,
  exchangeRate: false,
  partyCode: false,
  remarks: false,
  updatedAt: false,
  updatedBy: false,
};

export const CashAdvanceDefaultColumnOrder: ColumnOrderState = [
  "transNo",
  "documentDate",
  "partyCode",
  "partyName",
  "accountCode",
  "accountTitle",
  "currency",
  "exchangeRate",
  "amount",
  "remarks",
  "createdBy",
  "createdAt",
  "updatedBy",
  "updatedAt",
  "status",
  "actions",
];

export const CashAdvanceStatusFilterOptions = [
  { label: "All statuses", value: CashAdvanceAllStatusFilter },
  { label: "Draft", value: CashAdvanceStatuses.Draft },
  {
    label: "For Approval",
    value: CashAdvanceStatuses.ForApproval,
  },
  {
    label: "Posted",
    value: CashAdvanceStatuses.Posted,
  },
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

export const CashAdvanceDetailsTabs: {
  id: CashAdvanceDetailsTab;
  label: string;
}[] = [
  { id: "details", label: "Cash Advance Details" },
  { id: "attachment", label: "File Attachments" },
];

export const CashAdvanceEntryTabs: {
  id: CashAdvanceTab;
  label: string;
}[] = [
  { id: "items", label: "Item Details" },
  { id: "accounting", label: "Accounting Entries" },
];

export const CashAdvanceItemColumnOrder = [
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

export const CashAdvanceItemColumnLabels: Record<string, string> = {
  partyCode: "Employee Code",
  partyName: "Employee Name",
  amount: "Cash Advance Amount",
  cashAdvanceLimit: "Cash Advance Limit",
  totalCashAdvanced: "Total Cash Advances",
  cashAdvanceBalance: "Available Cash Advance",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenter: "Responsibility Center",
  particulars: "Particulars",
};

export const CashAdvanceItemColumnWidths: Record<string, number> = {
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

export const CashAdvanceDetailTablePreferencesStorageKey = "gr8books:cash-advance:detail-table-preferences";

export const CashAdvanceDefaultItemColumnIds = [
  "partyName",
  "amount",
  "cashAdvanceLimit",
  "totalCashAdvanced",
  "cashAdvanceBalance",
];

export const CashAdvanceProtectedItemColumnIds = new Set(["partyName", "amount"]);

export const CashAdvanceDefaultAccountingColumnIds = ["accountTitle", "credit", "debit", "partyName"];
