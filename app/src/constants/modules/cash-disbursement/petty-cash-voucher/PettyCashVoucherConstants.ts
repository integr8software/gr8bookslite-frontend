import type {
  PettyCashVoucherActionTab,
  PettyCashVoucherFormMode,
  PettyCashVoucherFormStatus,
  PettyCashVoucherStatus,
  PettyCashVoucherVATable,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const PettyCashVoucherLink = getModuleRoute("PCV");
export const PettyCashVoucherAddLink = `${PettyCashVoucherLink}/add`;
export const getPettyCashVoucherEditLink = (recordId: string) => `${PettyCashVoucherLink}/edit/${recordId}`;
export const getPettyCashVoucherViewLink = (recordId: string) => `${PettyCashVoucherLink}/view/${recordId}`;

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
  PettyCashVoucherStatuses.posted,
  PettyCashVoucherStatuses.forApproval,
  PettyCashVoucherStatuses.draft,
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
  voucherNo: "Voucher No.",
  documentDate: "PCV Date",
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
  actions: "Actions",
} as const;

export const PettyCashVoucherDefaultVisibleColumnIds = ["voucherNo", "documentDate", "partyName", "amount", "status", "actions"] as const;

export const PettyCashVoucherDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashVoucherColumnLabels).map((columnId) => [
    columnId,
    PettyCashVoucherDefaultVisibleColumnIds.includes(columnId as (typeof PettyCashVoucherDefaultVisibleColumnIds)[number]),
  ]),
);

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
      title: "Approve Petty Cash Voucher?",
      tone: "success" as const,
    };
  }

  if (status === PettyCashVoucherStatuses.disapproved) {
    return {
      confirmLabel: "Disapprove Voucher",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove Petty Cash Voucher?",
      tone: "danger" as const,
    };
  }

  if (status === PettyCashVoucherStatuses.cancelled) {
    return {
      confirmLabel: "Cancel Voucher",
      description: `This will mark ${recordLabel} as Cancelled.`,
      iconTone: "cancel" as const,
      pendingLabel: "Cancelling...",
      title: "Cancel Petty Cash Voucher?",
      tone: "warning" as const,
    };
  }

  return {
    confirmLabel: "Restore Voucher",
    description: `This will return ${recordLabel} to For Approval.`,
    iconTone: "undo" as const,
    pendingLabel: "Restoring...",
    title: "Restore Petty Cash Voucher?",
    tone: "default" as const,
  };
}

export function getPettyCashVoucherSaveDialogCopy(
  action: "submit" | "draft",
  mode: PettyCashVoucherFormMode,
  recordLabel: string,
) {
  if (action === "draft") {
    return {
      confirmLabel: "Save as Draft",
      description: `This will save the current information for ${recordLabel} without submitting it for approval.`,
      iconTone: "save" as const,
      pendingLabel: "Saving...",
      title: "Save Petty Cash Voucher as Draft?",
      tone: "default" as const,
    };
  }

  return {
    confirmLabel: mode === "edit" ? "Update and Submit" : "Submit Voucher",
    description: `This will save ${recordLabel} and submit it for approval.`,
    iconTone: mode === "edit" ? ("update" as const) : ("save" as const),
    pendingLabel: mode === "edit" ? "Updating..." : "Submitting...",
    title: mode === "edit" ? "Update Petty Cash Voucher?" : "Submit Petty Cash Voucher?",
    tone: "default" as const,
  };
}

export function getPettyCashVoucherActionTitle(mode: PettyCashVoucherFormMode, voucherNo?: string) {
  if (mode === "view") return voucherNo ? `View Petty Cash Voucher | ${voucherNo}` : "View Petty Cash Voucher";
  if (mode === "edit") return voucherNo ? `Edit Petty Cash Voucher | ${voucherNo}` : "Edit Petty Cash Voucher";
  return "Add Petty Cash Voucher";
}

export const PettyCashVoucherActionDescriptions: Record<PettyCashVoucherFormMode, string> = {
  add: "Complete the voucher header on one page before saving.",
  edit: "Complete the voucher header on one page before saving.",
  view: "Review the voucher details and supporting attachments.",
};
