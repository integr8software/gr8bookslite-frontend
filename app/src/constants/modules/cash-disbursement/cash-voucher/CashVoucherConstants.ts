import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { CashDisbursementOverviewActionColumnWidth } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import type {
  CashVoucherActionMode,
  CashVoucherActionTab,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

export function getCashVoucherSubmitDialogCopy(mode: CashVoucherActionMode, status: CashVoucherStatus) {
  const isDraft = status === CashVoucherStatuses.draft;
  const confirmLabel = mode === "edit" ? "Update" : isDraft ? "Save as Draft" : "Save and Submit";

  return {
    confirmLabel,
    description: `Confirm that you want to ${confirmLabel.toLowerCase()} this Cash Voucher.`,
    pendingLabel: mode === "edit" ? "Updating..." : "Saving...",
    title: `${confirmLabel} Cash Voucher?`,
  };
}

export const CashVoucherLink = getModuleRoute("CV");
export const CashVoucherAddLink = `${CashVoucherLink}/add`;
export const getCashVoucherEditLink = (recordId: string) => `${CashVoucherLink}/edit/${recordId}`;
export const getCashVoucherViewLink = (recordId: string) => `${CashVoucherLink}/view/${recordId}`;

export const CashVoucherQueryKeys = {
  transactions: () => ["cash-disbursement", "cash-voucher", "transactions"] as const,
  vouchers: () => ["cash-disbursement", "cash-voucher", "vouchers"] as const,
};

export const CashVoucherTablePaginationStorageKey = "cash-disbursement-cash-voucher";

export const CashVoucherTablePreferencesStorageKey = "gr8booksneo:cash-voucher:table-preferences";
export const CashVoucherTablePreferencesModuleKey = "cash-disbursement:cash-voucher";
export const CashVoucherTransactionStorageKey = "gr8books.cash-voucher.transactions";
export const CashVoucherRecordStorageKey = "gr8books.cash-voucher.vouchers";
export const CashVoucherAccountingGridSessionStorageKey = "gr8books.cashVoucher.accountingGrid";

export const CashVoucherBankSelectPlaceholder = "--Select Bank--";
export const CashVoucherBankSearchPlaceholder = "Search bank";

export const CashVoucherFieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

export const CashVoucherPdfNoBordersLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

export const CashVoucherPdfOuterLayout = {
  ...CashVoucherPdfNoBordersLayout,
  hLineWidth: () => 1,
  vLineWidth: () => 1,
};

export const CashVoucherPdfThinGridLayout = {
  ...CashVoucherPdfNoBordersLayout,
  hLineWidth: () => 0.35,
  vLineWidth: () => 0.35,
};

export const CashVoucherNotFoundCopy = {
  actionLabel: "Return to Cash Vouchers",
  description: "The selected transaction is no longer available, or the voucher link is no longer valid.",
  title: "CashVoucher record not found",
} as const;

export const CashVoucherActionTabs: {
  id: CashVoucherActionTab;
  label: string;
}[] = [
  { id: "details", label: "Voucher Details" },
  { id: "attachments", label: "File Attachments" },
];

export const CashVoucherStatuses = {
  cancelled: "Cancelled",
  closed: "Closed",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;

export const CashVoucherAllStatusFilter = "all";

export const CashVoucherWorkflowSteps = [
  {
    id: "details",
    title: "Voucher Details",
    description: "Select the transaction and define core payment information.",
  },
  {
    id: "entries",
    title: "Line Entries",
    description: "Capture the debit and credit lines for the disbursement.",
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm the summary before saving the voucher.",
  },
] as const;

export const CashVoucherStatusFilters = [
  CashVoucherAllStatusFilter,
  CashVoucherStatuses.draft,
  CashVoucherStatuses.forApproval,
  CashVoucherStatuses.posted,
  CashVoucherStatuses.disapproved,
  CashVoucherStatuses.cancelled,
  CashVoucherStatuses.closed,
] as const;

export const CashVoucherStatusFilterOptions = [
  { label: "All statuses", value: CashVoucherAllStatusFilter },
  {
    label: CashVoucherStatuses.draft,
    value: CashVoucherStatuses.draft,
  },
  {
    label: CashVoucherStatuses.forApproval,
    value: CashVoucherStatuses.forApproval,
  },
  {
    label: CashVoucherStatuses.posted,
    value: CashVoucherStatuses.posted,
  },
  {
    label: CashVoucherStatuses.disapproved,
    value: CashVoucherStatuses.disapproved,
  },
  {
    label: CashVoucherStatuses.cancelled,
    value: CashVoucherStatuses.cancelled,
  },
  {
    label: CashVoucherStatuses.closed,
    value: CashVoucherStatuses.closed,
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
    key: "amount",
    label: "Amount",
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
    size: CashDisbursementOverviewActionColumnWidth,
  },
] as const;

export const CashVoucherDefaultColumnOrder = CashVoucherTableColumns.map((column) =>
  "key" in column ? column.key : "actions",
);

export const CashVoucherDefaultColumnVisibility: VisibilityState = {
  currency: false,
  createdBy: false,
  createdAt: false,
  partyCode: false,
  remarks: false,
  updatedBy: false,
  updatedAt: false,
};

export const CashVoucherDefaultSorting: SortingState = [{ id: "documentDate", desc: true }];

export function canEditCashVoucherStatus(status: CashVoucherStatus) {
  return status === CashVoucherStatuses.draft || status === CashVoucherStatuses.forApproval;
}

export function canApproveCashVoucherStatus(status: CashVoucherStatus) {
  return status === CashVoucherStatuses.forApproval || status === CashVoucherStatuses.posted;
}

export function canDisapproveCashVoucherStatus(status: CashVoucherStatus) {
  return status === CashVoucherStatuses.forApproval || status === CashVoucherStatuses.disapproved;
}

export function canCancelCashVoucherStatus(status: CashVoucherStatus) {
  return (
    status === CashVoucherStatuses.draft ||
    status === CashVoucherStatuses.forApproval ||
    status === CashVoucherStatuses.cancelled
  );
}

export function getCashVoucherStatusDialogCopy(
  status: CashVoucherStatus,
  recordLabel: string,
  currentStatus?: CashVoucherStatus,
) {
  if (status === CashVoucherStatuses.forApproval && currentStatus === CashVoucherStatuses.posted) {
    return {
      confirmLabel: "Undo Approved",
      description: `This will undo the approval of ${recordLabel} and return it to For Approval.`,
      iconTone: "question" as const,
      pendingLabel: "Undoing Approval...",
      title: "Undo Approved Cash Voucher?",
      tone: "question" as const,
    };
  }

  if (status === CashVoucherStatuses.forApproval && currentStatus === CashVoucherStatuses.disapproved) {
    return {
      confirmLabel: "Undo Disapproved",
      description: `This will undo the disapproval of ${recordLabel} and return it to For Approval.`,
      iconTone: "question" as const,
      pendingLabel: "Undoing Disapproval...",
      title: "Undo Disapproved Cash Voucher?",
      tone: "question" as const,
    };
  }

  if (currentStatus === CashVoucherStatuses.cancelled) {
    return {
      confirmLabel: "Undo Cancelled",
      description: `This will undo the cancellation of ${recordLabel}.`,
      iconTone: "question" as const,
      pendingLabel: "Undoing Cancellation...",
      title: "Undo Cancelled Cash Voucher?",
      tone: "question" as const,
    };
  }

  if (status === CashVoucherStatuses.posted) {
    return {
      confirmLabel: "Approve Voucher",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Cash Voucher?",
      tone: "success" as const,
    };
  }

  if (status === CashVoucherStatuses.disapproved) {
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
    tone: "danger" as const,
  };
}


