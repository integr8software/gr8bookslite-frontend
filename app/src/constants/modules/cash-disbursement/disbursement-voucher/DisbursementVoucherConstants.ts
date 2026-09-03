import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import type {
  DisbursementVoucherActionMode,
  DisbursementVoucherActionTab,
  DisbursementVoucherCopySource,
  DisbursementVoucherPaymentErrorField,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function getDisbursementVoucherSubmitDialogCopy(
  mode: DisbursementVoucherActionMode,
  status: DisbursementVoucherStatus,
  recordLabel = "this disbursement voucher",
) {
  const isDraft = status === DisbursementVoucherStatuses.Draft;
  const isEdit = mode === DisbursementVoucherActionModes.Edit;
  const title = isEdit ? "Update Disbursement Voucher?" : isDraft ? "Save Disbursement Voucher as Draft?" : "Save Disbursement Voucher?";
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

export const DisbursementVoucherLink = getModuleRoute("DV");
export const DisbursementVoucherAddLink = `${DisbursementVoucherLink}/add`;
export const getDisbursementVoucherEditLink = (recordId: string) => `${DisbursementVoucherLink}/edit/${recordId}`;
export const getDisbursementVoucherViewLink = (recordId: string) => `${DisbursementVoucherLink}/view/${recordId}`;

export const DisbursementVoucherActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, DisbursementVoucherActionMode>;

export const DisbursementVoucherTablePaginationStorageKey = "cash-disbursement-disbursement-voucher";

export const DisbursementVoucherTablePreferencesStorageKey = "gr8booksneo:disbursement-voucher:table-preferences";
export const DisbursementVoucherTablePreferencesModuleKey = "cash-disbursement:disbursement-voucher";
export const DisbursementVoucherTransactionStorageKey = "gr8books.disbursement-voucher.transactions";
export const DisbursementVoucherRecordStorageKey = "gr8books.disbursement-voucher.vouchers";

export const DisbursementVoucherBankSelectPlaceholder = "--Select Bank--";
export const DisbursementVoucherBankSearchPlaceholder = "Search bank";

export const DisbursementVoucherCopySources: DisbursementVoucherCopySource[] = [
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

export const DisbursementVoucherNotFoundCopy = {
  actionLabel: "Return to Disbursement Vouchers",
  description: "The selected transaction is no longer available, or the voucher link is no longer valid.",
  title: "Disbursement record not found",
} as const;

export const DisbursementVoucherActionTabs: {
  id: DisbursementVoucherActionTab;
  label: string;
}[] = [
  { id: "details", label: "Voucher Details" },
  { id: "payment-information", label: "Payment Information" },
  { id: "attachments", label: "File Attachments" },
];

export const DisbursementVoucherPaymentInformationErrorFields = [
  "bankAccountCode",
  "checkDate",
  "checkNo",
  "payee",
  "transferAccountNo",
  "transferToBank",
] as const satisfies readonly DisbursementVoucherPaymentErrorField[];

export const DisbursementVoucherStatuses = {
  Cancelled: "Cancelled",
  Closed: "Closed",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, DisbursementVoucherStatus>;

export const DisbursementVoucherAllStatusFilter = "all";

export const EditableDisbursementVoucherStatuses: readonly DisbursementVoucherStatus[] = [DisbursementVoucherStatuses.Draft];

export const DisbursementVoucherWorkflowSteps = [
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

export const DisbursementVoucherRecordStatuses = [
  DisbursementVoucherStatuses.Draft,
  DisbursementVoucherStatuses.ForApproval,
  DisbursementVoucherStatuses.Posted,
  DisbursementVoucherStatuses.Disapproved,
  DisbursementVoucherStatuses.Cancelled,
  DisbursementVoucherStatuses.Closed,
] as const satisfies readonly DisbursementVoucherStatus[];

export const DisbursementVoucherStatusFilters = [
  DisbursementVoucherAllStatusFilter,
  ...DisbursementVoucherRecordStatuses,
] as const;

export const DisbursementVoucherStatusFilterOptions = [
  { label: "All statuses", value: DisbursementVoucherAllStatusFilter },
  {
    label: "Draft",
    value: DisbursementVoucherStatuses.Draft,
  },
  {
    label: "For Approval",
    value: DisbursementVoucherStatuses.ForApproval,
  },
  {
    label: "Posted",
    value: DisbursementVoucherStatuses.Posted,
  },
  {
    label: "Disapproved",
    value: DisbursementVoucherStatuses.Disapproved,
  },
  {
    label: "Cancelled",
    value: DisbursementVoucherStatuses.Cancelled,
  },
  {
    label: "Closed",
    value: DisbursementVoucherStatuses.Closed,
  },
] as const;

export const DisbursementVoucherTableColumns = [
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
    key: "paymentType",
    label: "Payment Type",
    className: "",
    size: TransactionOverviewColumnWidths.paymentType,
  },
  {
    key: "currency",
    label: "Currency",
    className: "",
    size: TransactionOverviewColumnWidths.currency,
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

export const DisbursementVoucherDefaultColumnOrder = DisbursementVoucherTableColumns.map((column) =>
  "key" in column ? column.key : "actions",
);

export const DisbursementVoucherDefaultColumnVisibility: VisibilityState = {
  currency: false,
  createdBy: false,
  createdAt: false,
  partyCode: false,
  remarks: false,
  updatedBy: false,
  updatedAt: false,
  disburseAmount: false,
};

export const DisbursementVoucherDefaultSorting: SortingState = [{ id: "documentDate", desc: true }];

export function canEditDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return EditableDisbursementVoucherStatuses.includes(status);
}

export function canApproveDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return status === DisbursementVoucherStatuses.ForApproval || status === DisbursementVoucherStatuses.Posted;
}

export function canDisapproveDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return status === DisbursementVoucherStatuses.ForApproval || status === DisbursementVoucherStatuses.Disapproved;
}

export function canCancelDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return (
    status === DisbursementVoucherStatuses.Draft ||
    status === DisbursementVoucherStatuses.ForApproval ||
    status === DisbursementVoucherStatuses.Cancelled
  );
}

export function getDisbursementVoucherStatusDialogCopy(
  status: DisbursementVoucherStatus,
  recordLabel: string,
  currentStatus?: DisbursementVoucherStatus,
) {
  if (status === DisbursementVoucherStatuses.ForApproval && currentStatus === DisbursementVoucherStatuses.Posted) {
    return {
      confirmLabel: "Undo Approved",
      description: `This will undo the approval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Approval...",
      title: "Undo Approved Disbursement Voucher?",
      tone: "question" as const,
    };
  }

  if (status === DisbursementVoucherStatuses.ForApproval && currentStatus === DisbursementVoucherStatuses.Disapproved) {
    return {
      confirmLabel: "Undo Disapproved",
      description: `This will undo the disapproval of ${recordLabel} and return it to For Approval.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Disapproval...",
      title: "Undo Disapproved Disbursement Voucher?",
      tone: "question" as const,
    };
  }

  if (currentStatus === DisbursementVoucherStatuses.Cancelled) {
    return {
      confirmLabel: "Undo Cancelled",
      description: `This will undo the cancellation of ${recordLabel}.`,
      iconTone: "undo" as const,
      pendingLabel: "Undoing Cancellation...",
      title: "Undo Cancelled Disbursement Voucher?",
      tone: "question" as const,
    };
  }

  if (status === DisbursementVoucherStatuses.Posted) {
    return {
      confirmLabel: "Approve Voucher",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Disbursement Voucher?",
      tone: "success" as const,
    };
  }

  if (status === DisbursementVoucherStatuses.Disapproved) {
    return {
      confirmLabel: "Disapprove Voucher",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove Disbursement Voucher?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark as Cancelled",
    description: `This will mark ${recordLabel} as Cancelled.`,
    iconTone: "cancel" as const,
    pendingLabel: "Cancelling...",
    title: "Make Disbursement Voucher as Cancelled",
    tone: "warning" as const,
  };
}
