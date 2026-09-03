import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import type { ColumnOrderState, VisibilityState } from "@tanstack/react-table";
import type {
  CashAdvanceMultipleEntryActionMode,
  CashAdvanceMultipleEntryDetailsTab,
  CashAdvanceMultipleEntrySubmitConfirmationAction,
  CashAdvanceMultipleEntryTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

export const CashAdvanceMultipleEntryLink = getModuleRoute("CAME");
export const CashAdvanceMultipleEntryAddLink = `${CashAdvanceMultipleEntryLink}/add`;
export const getCashAdvanceMultipleEntryEditLink = (recordId: string) => `${CashAdvanceMultipleEntryLink}/edit/${recordId}`;
export const getCashAdvanceMultipleEntryViewLink = (recordId: string) => `${CashAdvanceMultipleEntryLink}/view/${recordId}`;

export const CashAdvanceMultipleEntryActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, CashAdvanceMultipleEntryActionMode>;

export const CashAdvanceMultipleEntryTablePaginationStorageKey = "cash-disbursement-cash-advance-multiple-entry";

export const CashAdvanceMultipleEntryOverviewColumnWidths = {
  ...TransactionOverviewColumnWidths,
  partyName: 220,
  accountTitle: 230,
  actions: TransactionOverviewColumnWidths.actions,
} as const;

export const CashAdvanceMultipleEntryStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, CashAdvanceStatus>;

export const EditableCashAdvanceMultipleEntryStatuses: readonly CashAdvanceStatus[] = [CashAdvanceMultipleEntryStatuses.Draft];

export function canEditCashAdvanceMultipleEntryStatus(status: CashAdvanceStatus) {
  return EditableCashAdvanceMultipleEntryStatuses.includes(status);
}

export const CashAdvanceMultipleEntrySubmitConfirmationDialogTitles: Record<CashAdvanceMultipleEntrySubmitConfirmationAction, string> = {
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
  if (status === CashAdvanceMultipleEntryStatuses.ForApproval && currentStatus === CashAdvanceMultipleEntryStatuses.Posted) {
    return {
      confirmLabel: "Undo Approved",
      description: `This will undo the approval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Approval...",
      title: "Undo Approved Cash Advance Multiple Entry?",
      tone: "question" as const,
    };
  }

  if (status === CashAdvanceMultipleEntryStatuses.ForApproval && currentStatus === CashAdvanceMultipleEntryStatuses.Disapproved) {
    return {
      confirmLabel: "Undo Disapproved",
      description: `This will undo the disapproval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Disapproval...",
      title: "Undo Disapproved Cash Advance Multiple Entry?",
      tone: "question" as const,
    };
  }

  if (currentStatus === CashAdvanceMultipleEntryStatuses.Cancelled) {
    return {
      confirmLabel: "Undo Cancelled",
      description: `This will undo the cancellation of ${recordLabel}.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Cancellation...",
      title: "Undo Cancelled Cash Advance Multiple Entry?",
      tone: "question" as const,
    };
  }

  if (status === CashAdvanceMultipleEntryStatuses.Posted) {
    return {
      confirmLabel: "Approve Entry",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Cash Advance Multiple Entry?",
      tone: "success" as const,
    };
  }

  if (status === CashAdvanceMultipleEntryStatuses.Disapproved) {
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
  currency: false,
  exchangeRate: false,
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

export const CashAdvanceMultipleEntryStatusFilterOptions = [
  { label: "All statuses", value: CashAdvanceMultipleEntryAllStatusFilter },
  { label: "Draft", value: CashAdvanceMultipleEntryStatuses.Draft },
  {
    label: "For Approval",
    value: CashAdvanceMultipleEntryStatuses.ForApproval,
  },
  {
    label: "Posted",
    value: CashAdvanceMultipleEntryStatuses.Posted,
  },
  {
    label: "Disapproved",
    value: CashAdvanceMultipleEntryStatuses.Disapproved,
  },
  {
    label: "Cancelled",
    value: CashAdvanceMultipleEntryStatuses.Cancelled,
  },
] as const;

export const CashAdvanceMultipleEntryRecordStatuses = [
  CashAdvanceMultipleEntryStatuses.Draft,
  CashAdvanceMultipleEntryStatuses.ForApproval,
  CashAdvanceMultipleEntryStatuses.Posted,
  CashAdvanceMultipleEntryStatuses.Disapproved,
  CashAdvanceMultipleEntryStatuses.Cancelled,
] as const satisfies readonly CashAdvanceStatus[];

export const CashAdvanceMultipleEntryStatusFilters = [
  CashAdvanceMultipleEntryAllStatusFilter,
  ...CashAdvanceMultipleEntryRecordStatuses,
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

export const CashAdvanceMultipleEntryDetailTablePreferencesStorageKey = "gr8books:cash-advance-multiple-entry:detail-table-preferences";

export const CashAdvanceMultipleEntryDefaultItemColumnIds = [
  "partyName",
  "amount",
  "cashAdvanceLimit",
  "totalCashAdvanced",
  "cashAdvanceBalance",
];

export const CashAdvanceMultipleEntryProtectedItemColumnIds = new Set(["partyName", "amount"]);

export const CashAdvanceMultipleEntryDefaultAccountingColumnIds = ["accountTitle", "credit", "debit", "partyName"];
