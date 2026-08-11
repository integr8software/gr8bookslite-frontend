import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  DisbursementVoucherActionTab,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export const DisbursementVoucherHref = getModuleRoute("DV");

export const DisbursementVoucherTablePaginationStorageKey = "cash-disbursement-disbursement-voucher";

export const DisbursementVoucherTablePreferencesStorageKey = "gr8booksneo:disbursement-voucher:table-preferences:v2";
export const DisbursementVoucherTablePreferencesModuleKey = "cash-disbursement:disbursement-voucher";
export const DisbursementVoucherTransactionStorageKey = "gr8books.disbursement-voucher.transactions";
export const DisbursementVoucherRecordStorageKey = "gr8books.disbursement-voucher.vouchers";

export const DisbursementVoucherBankSelectPlaceholder = "--Select Bank--";
export const DisbursementVoucherBankSearchPlaceholder = "Search bank";

export const DisbursementVoucherFieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

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
  { id: "attachments", label: "File Attachments" },
];

export const DisbursementVoucherStatuses = {
  cancelled: "Cancelled",
  closed: "Closed",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  posted: "Posted",
} as const;

export const DisbursementVoucherWorkflowSteps = [
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

export const DisbursementVoucherStatusFilters = [
  "all",
  DisbursementVoucherStatuses.draft,
  DisbursementVoucherStatuses.forApproval,
  DisbursementVoucherStatuses.posted,
  DisbursementVoucherStatuses.disapproved,
  DisbursementVoucherStatuses.cancelled,
  DisbursementVoucherStatuses.closed,
] as const;

export const DisbursementVoucherStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  {
    label: DisbursementVoucherStatuses.draft,
    value: DisbursementVoucherStatuses.draft,
  },
  {
    label: DisbursementVoucherStatuses.forApproval,
    value: DisbursementVoucherStatuses.forApproval,
  },
  {
    label: DisbursementVoucherStatuses.posted,
    value: DisbursementVoucherStatuses.posted,
  },
  {
    label: DisbursementVoucherStatuses.disapproved,
    value: DisbursementVoucherStatuses.disapproved,
  },
  {
    label: DisbursementVoucherStatuses.cancelled,
    value: DisbursementVoucherStatuses.cancelled,
  },
  {
    label: DisbursementVoucherStatuses.closed,
    value: DisbursementVoucherStatuses.closed,
  },
] as const;

export const DisbursementVoucherTableColumns = [
  {
    key: "voucherNo",
    label: "Voucher No.",
    className: "w-[12rem]",
  },
  {
    key: "documentDate",
    label: "Document Date",
    className: "w-[10rem]",
  },
  {
    key: "partyCode",
    label: "Party Code",
    className: "w-[10rem]",
  },
  {
    key: "partyName",
    label: "Party Name",
    className: "w-[18rem]",
  },
  {
    key: "paymentType",
    label: "Payment Type",
    className: "w-[12rem]",
  },
  {
    key: "remarks",
    label: "Remarks",
    className: "w-[20rem]",
  },
  {
    key: "currency",
    label: "Currency",
    className: "w-[8rem]",
  },
  {
    key: "amount",
    label: "Amount",
    className: "w-[11rem]",
  },
  {
    key: "createdBy",
    label: "Created By",
    className: "w-[14rem]",
  },
  {
    key: "createdAt",
    label: "Date Created",
    className: "w-[16rem]",
  },
  {
    key: "updatedBy",
    label: "Updated By",
    className: "w-[14rem]",
  },
  {
    key: "updatedAt",
    label: "Date Modified",
    className: "w-[16rem]",
  },
  {
    key: "status",
    label: "Status",
    className: "w-[10rem]",
  },
  {
    label: "Action",
    className: "w-[14rem] text-center",
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
};

export const DisbursementVoucherDefaultSorting: SortingState = [{ id: "documentDate", desc: true }];

export function canEditDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return status === DisbursementVoucherStatuses.draft || status === DisbursementVoucherStatuses.forApproval;
}

export function canApproveDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return status === DisbursementVoucherStatuses.forApproval || status === DisbursementVoucherStatuses.posted;
}

export function canDisapproveDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return status === DisbursementVoucherStatuses.forApproval || status === DisbursementVoucherStatuses.disapproved;
}

export function canCancelDisbursementVoucherStatus(status: DisbursementVoucherStatus) {
  return (
    status === DisbursementVoucherStatuses.draft ||
    status === DisbursementVoucherStatuses.forApproval ||
    status === DisbursementVoucherStatuses.cancelled
  );
}

export function getDisbursementVoucherStatusDialogCopy(status: DisbursementVoucherStatus, recordLabel: string) {
  if (status === DisbursementVoucherStatuses.posted) {
    return {
      confirmLabel: "Approve Voucher",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve disbursement voucher?",
      tone: "success" as const,
    };
  }

  if (status === DisbursementVoucherStatuses.disapproved) {
    return {
      confirmLabel: "Disapprove Voucher",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove disbursement voucher?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark as Cancelled",
    description: `This will mark ${recordLabel} as Cancelled.`,
    iconTone: "cancel" as const,
    pendingLabel: "Cancelling...",
    title: "Make Disbursement Voucher as Cancelled",
    tone: "danger" as const,
  };
}
