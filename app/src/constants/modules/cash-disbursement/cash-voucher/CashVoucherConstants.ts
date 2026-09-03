import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import type {
  CashVoucherActionMode,
  CashVoucherActionTab,
  CashVoucherCopySource,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

export function getCashVoucherSubmitDialogCopy(mode: CashVoucherActionMode, status: CashVoucherStatus, recordLabel = "this cash voucher") {
  const isDraft = status === CashVoucherStatuses.Draft;
  const isEdit = mode === CashVoucherActionModes.Edit;
  const title = isEdit ? "Update Cash Voucher?" : isDraft ? "Save Cash Voucher as Draft?" : "Save Cash Voucher?";
  const description = isEdit
    ? `This will update ${recordLabel}.`
    : isDraft
      ? `This will save ${recordLabel} as draft.`
      : `This will save and submit ${recordLabel}.`;
  const confirmLabel = isEdit ? "Update" : isDraft ? "Save as Draft" : "Save and Submit";

  return {
    confirmLabel,
    description,
    iconTone: isEdit ? ("update" as const) : ("save" as const),
    pendingLabel: isEdit ? "Updating..." : "Saving...",
    title,
  };
}

export const CashVoucherLink = getModuleRoute("CV");
export const CashVoucherAddLink = `${CashVoucherLink}/add`;
export const getCashVoucherEditLink = (recordId: string) => `${CashVoucherLink}/edit/${recordId}`;
export const getCashVoucherViewLink = (recordId: string) => `${CashVoucherLink}/view/${recordId}`;

export const CashVoucherActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, CashVoucherActionMode>;

export const CashVoucherTablePaginationStorageKey = "cash-disbursement-cash-voucher";
export const CashVoucherTablePreferencesStorageKey = "gr8booksneo:cash-voucher:table-preferences";
export const CashVoucherTablePreferencesModuleKey = "cash-disbursement:cash-voucher";

export const CashVoucherBankSelectPlaceholder = "--Select Bank--";
export const CashVoucherBankSearchPlaceholder = "Search Bank";

export const CashVoucherCopySources: CashVoucherCopySource[] = [
  "Accounts Payable Voucher",
  "Advances to Suppliers",
  "Cash Advance",
  "Cash Advance Liquidation",
  "Cash Advance Multiple Entry",
  "Cash Advance Multiple Entry Liquidation",
  "Petty Cash Fund",
  "Petty Cash Replenishment",
  "Revolving Fund",
  "Revolving Fund Replenishment",
  "Revolving Fund Return",
  "Purchase Order",
  "Purchase Journal",
  "Receiving Report",
];

export const CashVoucherNotFoundCopy = {
  actionLabel: "Return to Cash Vouchers",
  description: "The selected transaction is no longer available, or the voucher link is no longer valid.",
  title: "Cash Voucher Record Not Found",
} as const;

export const CashVoucherActionTabs: {
  id: CashVoucherActionTab;
  label: string;
}[] = [
  { id: "details", label: "Voucher Details" },
  { id: "attachments", label: "File Attachments" },
];

export const CashVoucherStatuses = {
  Cancelled: "Cancelled",
  Closed: "Closed",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, CashVoucherStatus>;

export const CashVoucherAllStatusFilter = "all";

export const EditableCashVoucherStatuses: readonly CashVoucherStatus[] = [CashVoucherStatuses.Draft];

export const CashVoucherWorkflowSteps = [
  {
    id: "details",
    title: "Voucher Details",
    description: "Select the transaction and define core payment information.",
  },
  {
    id: "entries",
    title: "Disbursement Details",
    description: "Capture the debit and credit lines for the disbursement.",
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm the summary before saving the voucher.",
  },
] as const;

export const CashVoucherRecordStatuses = [
  CashVoucherStatuses.Draft,
  CashVoucherStatuses.ForApproval,
  CashVoucherStatuses.Posted,
  CashVoucherStatuses.Disapproved,
  CashVoucherStatuses.Cancelled,
  CashVoucherStatuses.Closed,
] as const satisfies readonly CashVoucherStatus[];

export const CashVoucherStatusFilters = [CashVoucherAllStatusFilter, ...CashVoucherRecordStatuses] as const;

export const CashVoucherStatusFilterOptions = [
  { label: "All statuses", value: CashVoucherAllStatusFilter },
  {
    label: "Draft",
    value: CashVoucherStatuses.Draft,
  },
  {
    label: "For Approval",
    value: CashVoucherStatuses.ForApproval,
  },
  {
    label: "Posted",
    value: CashVoucherStatuses.Posted,
  },
  {
    label: "Disapproved",
    value: CashVoucherStatuses.Disapproved,
  },
  {
    label: "Cancelled",
    value: CashVoucherStatuses.Cancelled,
  },
  {
    label: "Closed",
    value: CashVoucherStatuses.Closed,
  },
] as const;

export const CashVoucherTableColumns = [
  {
    key: "voucherNo",
    label: "Voucher No.",
    className: "",
    size: TransactionOverviewColumnWidths.transactionNumber,
  },
  {
    key: "documentDate",
    label: "Document Date",
    className: "",
    size: TransactionOverviewColumnWidths.documentDate,
  },
  {
    key: "partyCode",
    label: "Party Code",
    className: "",
    size: TransactionOverviewColumnWidths.partyCode,
  },
  {
    key: "partyName",
    label: "Party Name",
    className: "",
    size: TransactionOverviewColumnWidths.partyName,
  },
  {
    key: "currency",
    label: "Currency",
    className: "",
    size: TransactionOverviewColumnWidths.currency,
  },
  {
    key: "exchangeRate",
    label: "Exchange Rate",
    className: "",
    size: TransactionOverviewColumnWidths.exchangeRate,
  },
  {
    key: "amount",
    label: "Amount",
    className: "",
    size: TransactionOverviewColumnWidths.amount,
  },
  {
    key: "disburseAmount",
    label: "Total Disbursed",
    className: "",
    size: TransactionOverviewColumnWidths.amount,
  },
  {
    key: "remarks",
    label: "Remarks",
    className: "",
    size: TransactionOverviewColumnWidths.remarks,
  },
  {
    key: "createdBy",
    label: "Created By",
    className: "",
    size: TransactionOverviewColumnWidths.auditUser,
  },
  {
    key: "createdAt",
    label: "Date Created",
    className: "",
    size: TransactionOverviewColumnWidths.auditDate,
  },
  {
    key: "updatedBy",
    label: "Updated By",
    className: "",
    size: TransactionOverviewColumnWidths.auditUser,
  },
  {
    key: "updatedAt",
    label: "Date Modified",
    className: "",
    size: TransactionOverviewColumnWidths.auditDate,
  },
  {
    key: "status",
    label: "Status",
    className: "text-center",
    size: TransactionOverviewColumnWidths.status,
  },
  {
    label: "Actions",
    className: "text-center",
    size: TransactionOverviewColumnWidths.actions,
  },
] as const;

export const CashVoucherDefaultColumnOrder = CashVoucherTableColumns.map((column) => ("key" in column ? column.key : "actions"));

export const CashVoucherDefaultColumnVisibility: VisibilityState = {
  currency: false,
  exchangeRate: false,
  createdBy: false,
  createdAt: false,
  partyCode: false,
  remarks: false,
  updatedBy: false,
  updatedAt: false,
  disburseAmount: false,
};

export const CashVoucherDefaultSorting: SortingState = [{ id: "documentDate", desc: true }];

export function canEditCashVoucherStatus(status: CashVoucherStatus) {
  return EditableCashVoucherStatuses.includes(status);
}

export function canApproveCashVoucherStatus(status: CashVoucherStatus) {
  return status === CashVoucherStatuses.ForApproval || status === CashVoucherStatuses.Posted;
}

export function canDisapproveCashVoucherStatus(status: CashVoucherStatus) {
  return status === CashVoucherStatuses.ForApproval || status === CashVoucherStatuses.Disapproved;
}

export function canCancelCashVoucherStatus(status: CashVoucherStatus) {
  return status === CashVoucherStatuses.Draft || status === CashVoucherStatuses.ForApproval || status === CashVoucherStatuses.Cancelled;
}

export function getCashVoucherStatusDialogCopy(status: CashVoucherStatus, recordLabel: string, currentStatus?: CashVoucherStatus) {
  if (status === CashVoucherStatuses.ForApproval && currentStatus === CashVoucherStatuses.Posted) {
    return {
      confirmLabel: "Undo Approved",
      description: `This will undo the approval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Approval...",
      title: "Undo Approved Cash Voucher?",
      tone: "question" as const,
    };
  }

  if (status === CashVoucherStatuses.ForApproval && currentStatus === CashVoucherStatuses.Disapproved) {
    return {
      confirmLabel: "Undo Disapproved",
      description: `This will undo the disapproval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Disapproval...",
      title: "Undo Disapproved Cash Voucher?",
      tone: "question" as const,
    };
  }

  if (currentStatus === CashVoucherStatuses.Cancelled) {
    return {
      confirmLabel: "Undo Cancelled",
      description: `This will undo the cancellation of ${recordLabel}.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Cancellation...",
      title: "Undo Cancelled Cash Voucher?",
      tone: "question" as const,
    };
  }

  if (status === CashVoucherStatuses.Posted) {
    return {
      confirmLabel: "Approve Voucher",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Cash Voucher?",
      tone: "success" as const,
    };
  }

  if (status === CashVoucherStatuses.Disapproved) {
    return {
      confirmLabel: "Disapprove Voucher",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove Cash Voucher?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark as Cancelled",
    description: `This will mark ${recordLabel} as Cancelled.`,
    iconTone: "cancel" as const,
    pendingLabel: "Cancelling...",
    title: "Make Cash Voucher as Cancelled",
    tone: "warning" as const,
  };
}
