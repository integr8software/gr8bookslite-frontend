import type {
  PettyCashVoucherActionTab,
  PettyCashVoucherFormStatus,
  PettyCashVoucherStatus,
  PettyCashVoucherVATable,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const PettyCashVoucherHref = getModuleRoute("PCV");

export const PettyCashVoucherQueryKeys = {
  vouchers: () => ["cash-disbursement", "petty-cash-voucher", "vouchers"] as const,
};

export const PettyCashVoucherPaginationStorageKey = "petty-cash-voucher-table";

export const PettyCashVoucherTransactionPrefix = "PCV";

export const PettyCashVoucherTransactionNumberPadding = 6;

export const PettyCashVoucherDefaultFormStatus: PettyCashVoucherFormStatus = "Open";

export const PettyCashVoucherDefaultVATable: PettyCashVoucherVATable = "False";

export const PettyCashVoucherVatRate = 0.12;

export const PettyCashVoucherStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;

export const PettyCashVoucherRecordStatuses = [
  PettyCashVoucherStatuses.draft,
  PettyCashVoucherStatuses.forApproval,
  PettyCashVoucherStatuses.posted,
  PettyCashVoucherStatuses.disapproved,
  PettyCashVoucherStatuses.cancelled,
] as const satisfies readonly PettyCashVoucherStatus[];

export const PettyCashVoucherStatusOptions = ["All", ...PettyCashVoucherRecordStatuses] as const satisfies readonly (
  "All" | PettyCashVoucherStatus
)[];

export const PettyCashVoucherAllStatusFilter = "All";

export const PettyCashVoucherStatusMetricTones = {
  [PettyCashVoucherStatuses.draft]: "blue",
  [PettyCashVoucherStatuses.forApproval]: "amber",
  [PettyCashVoucherStatuses.posted]: "emerald",
  [PettyCashVoucherStatuses.disapproved]: "red",
  [PettyCashVoucherStatuses.cancelled]: "slate",
} as const;

export const PettyCashVoucherFormStatusOptions = [
  "Open",
  ...PettyCashVoucherRecordStatuses,
] as const satisfies readonly PettyCashVoucherFormStatus[];

export const PettyCashVoucherVATableOptions = ["False", "True"] as const satisfies readonly PettyCashVoucherVATable[];

export const PettyCashVoucherActionTabs: {
  id: PettyCashVoucherActionTab;
  label: string;
}[] = [
  { id: "details", label: "Voucher Details" },
  { id: "attachments", label: "File Attachments" },
];

export const PettyCashVoucherColumnLabels = {
  voucherNo: "Petty Cash Voucher No.",
  documentDate: "Document Date",
  partyCode: "Party Code",
  partyName: "Party Name",
  accountCode: "Default Account Code",
  accountTitle: "Default Account Title",
  amount: "Total Amount",
  remarks: "Remarks",
  createdBy: "Created By",
  dateCreated: "Date Created",
  updatedBy: "Updated By",
  dateModified: "Date Modified",
  status: "Status",
  actions: "Action",
} as const;

export const PettyCashVoucherDefaultVisibleColumnIds = ["voucherNo", "documentDate", "partyName", "amount", "status", "actions"] as const;

export const PettyCashVoucherDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashVoucherColumnLabels).map((columnId) => [
    columnId,
    PettyCashVoucherDefaultVisibleColumnIds.includes(columnId as (typeof PettyCashVoucherDefaultVisibleColumnIds)[number]),
  ]),
);

export const PettyCashVoucherActionButtonClassNames = {
  approve:
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 shadow-sm shadow-darknavy/5 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white",
  disapprove:
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm shadow-darknavy/5 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white",
  cancel:
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-700 shadow-sm shadow-darknavy/5 transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/15 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white",
  copyFrom:
    "theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
} as const;

export const PettyCashVoucherTableCellClassName = "px-4 py-4 align-middle text-sm text-darknavy";

export function canEditPettyCashVoucherStatus(status: PettyCashVoucherStatus) {
  return (
    status === PettyCashVoucherStatuses.draft ||
    status === PettyCashVoucherStatuses.forApproval ||
    status === PettyCashVoucherStatuses.disapproved
  );
}

export function canApprovePettyCashVoucherStatus(status: PettyCashVoucherFormStatus) {
  return status === PettyCashVoucherStatuses.forApproval || status === PettyCashVoucherStatuses.posted;
}

export function canDisapprovePettyCashVoucherStatus(status: PettyCashVoucherFormStatus) {
  return status === PettyCashVoucherStatuses.forApproval || status === PettyCashVoucherStatuses.disapproved;
}

export function canCancelPettyCashVoucherStatus(status: PettyCashVoucherFormStatus) {
  return (
    status === PettyCashVoucherStatuses.draft ||
    status === PettyCashVoucherStatuses.forApproval ||
    status === PettyCashVoucherStatuses.disapproved ||
    status === PettyCashVoucherStatuses.cancelled
  );
}

export function getPettyCashVoucherStatusDialogCopy(status: PettyCashVoucherStatus, recordLabel: string) {
  if (status === PettyCashVoucherStatuses.posted) {
    return {
      confirmLabel: "Approve Voucher",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve petty cash voucher?",
      tone: "success" as const,
    };
  }

  if (status === PettyCashVoucherStatuses.disapproved) {
    return {
      confirmLabel: "Disapprove Voucher",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove petty cash voucher?",
      tone: "danger" as const,
    };
  }

  if (status === PettyCashVoucherStatuses.cancelled) {
    return {
      confirmLabel: "Cancel Voucher",
      description: `This will mark ${recordLabel} as Cancelled.`,
      iconTone: "cancel" as const,
      pendingLabel: "Cancelling...",
      title: "Cancel petty cash voucher?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Restore Voucher",
    description: `This will return ${recordLabel} to For Approval.`,
    iconTone: "approve" as const,
    pendingLabel: "Restoring...",
    title: "Restore petty cash voucher?",
    tone: "default" as const,
  };
}
