import type {
  PettyCashVoucherActionMode,
  PettyCashVoucherActionTab,
  PettyCashVoucherFormStatus,
  PettyCashVoucherStatus,
  PettyCashVoucherVATable,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const PettyCashVoucherLink = getModuleRoute("PCV");
export const PettyCashVoucherAddLink = `${PettyCashVoucherLink}/add`;
export const getPettyCashVoucherEditLink = (recordId: string) => `${PettyCashVoucherLink}/edit/${recordId}`;
export const getPettyCashVoucherViewLink = (recordId: string) => `${PettyCashVoucherLink}/view/${recordId}`;

export const PettyCashVoucherActionModes = {
  Add: "add",
  Edit: "edit",
  View: "view",
} as const satisfies Record<string, PettyCashVoucherActionMode>;

export const PettyCashVoucherPaginationStorageKey = "petty-cash-voucher-table";

export const PettyCashVoucherTransactionPrefix = "PCV";

export const PettyCashVoucherTransactionNumberPadding = 6;

export const PettyCashVoucherDefaultFormStatus: PettyCashVoucherFormStatus = "Open";

export const PettyCashVoucherDefaultVATable: PettyCashVoucherVATable = "False";
export const PettyCashVoucherDefaultVatType = "";

export const PettyCashVoucherVatRate = 0.12;

export const PettyCashVoucherStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Open: "Open",
  Posted: "Posted",
} as const satisfies Record<string, PettyCashVoucherFormStatus>;

export const PettyCashVoucherRecordStatuses = [
  PettyCashVoucherStatuses.Draft,
  PettyCashVoucherStatuses.ForApproval,
  PettyCashVoucherStatuses.Posted,
  PettyCashVoucherStatuses.Disapproved,
  PettyCashVoucherStatuses.Cancelled,
] as const satisfies readonly PettyCashVoucherStatus[];

export const EditablePettyCashVoucherStatuses: readonly PettyCashVoucherStatus[] = [
  PettyCashVoucherStatuses.Draft,
  PettyCashVoucherStatuses.Disapproved,
];

export const PettyCashVoucherAllStatusFilter = "all";

export const PettyCashVoucherStatusFilterOptions = [
  { label: "All statuses", value: PettyCashVoucherAllStatusFilter },
  { label: "Draft", value: PettyCashVoucherStatuses.Draft },
  { label: "For Approval", value: PettyCashVoucherStatuses.ForApproval },
  { label: "Posted", value: PettyCashVoucherStatuses.Posted },
  { label: "Disapproved", value: PettyCashVoucherStatuses.Disapproved },
  { label: "Cancelled", value: PettyCashVoucherStatuses.Cancelled },
] as const;

export const PettyCashVoucherStatusFilters = [
  PettyCashVoucherAllStatusFilter,
  ...PettyCashVoucherRecordStatuses,
] as const;

export const PettyCashVoucherStatusMetricTones = {
  [PettyCashVoucherStatuses.Draft]: "blue",
  [PettyCashVoucherStatuses.ForApproval]: "amber",
  [PettyCashVoucherStatuses.Posted]: "emerald",
  [PettyCashVoucherStatuses.Disapproved]: "red",
  [PettyCashVoucherStatuses.Cancelled]: "slate",
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
  documentDate: "Document Date",
  partyCode: "Party Code",
  partyName: "Party Name",
  accountCode: "Default Account Code",
  accountTitle: "Default Account Title",
  currency: "Currency",
  exchangeRate: "Exchange Rate",
  amount: "Total Amount",
  disburseAmount: "Total Disbursed",
  remarks: "Remarks",
  createdBy: "Created By",
  dateCreated: "Date Created",
  updatedBy: "Updated By",
  dateModified: "Date Modified",
  status: "Status",
  actions: "Actions",
} as const;

export const PettyCashVoucherDefaultVisibleColumnIds = [
  "voucherNo",
  "documentDate",
  "partyName",
  "amount",
  "disburseAmount",
  "status",
  "actions",
] as const;

export const PettyCashVoucherDefaultColumnVisibility = Object.fromEntries(
  Object.keys(PettyCashVoucherColumnLabels).map((columnId) => [
    columnId,
    PettyCashVoucherDefaultVisibleColumnIds.includes(columnId as (typeof PettyCashVoucherDefaultVisibleColumnIds)[number]),
  ]),
);

export const PettyCashVoucherTableCellClassName = "px-4 py-4 align-middle text-sm text-darknavy";

export function canEditPettyCashVoucherStatus(status: PettyCashVoucherStatus) {
  return EditablePettyCashVoucherStatuses.includes(status);
}

export function canApprovePettyCashVoucherStatus(status: PettyCashVoucherFormStatus) {
  return status === PettyCashVoucherStatuses.ForApproval || status === PettyCashVoucherStatuses.Posted;
}

export function canDisapprovePettyCashVoucherStatus(status: PettyCashVoucherFormStatus) {
  return status === PettyCashVoucherStatuses.ForApproval || status === PettyCashVoucherStatuses.Disapproved;
}

export function canCancelPettyCashVoucherStatus(status: PettyCashVoucherFormStatus) {
  return (
    status === PettyCashVoucherStatuses.Draft ||
    status === PettyCashVoucherStatuses.ForApproval ||
    status === PettyCashVoucherStatuses.Disapproved ||
    status === PettyCashVoucherStatuses.Cancelled
  );
}

export function getPettyCashVoucherStatusDialogCopy(status: PettyCashVoucherStatus, recordLabel: string) {
  if (status === PettyCashVoucherStatuses.Posted) {
    return {
      confirmLabel: "Approve Voucher",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Petty Cash Voucher?",
      tone: "success" as const,
    };
  }

  if (status === PettyCashVoucherStatuses.Disapproved) {
    return {
      confirmLabel: "Disapprove Voucher",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove Petty Cash Voucher?",
      tone: "danger" as const,
    };
  }

  if (status === PettyCashVoucherStatuses.Cancelled) {
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

export function getPettyCashVoucherSaveDialogCopy(action: "submit" | "draft", mode: PettyCashVoucherActionMode, recordLabel: string) {
  if (action === "draft") {
    return {
      confirmLabel: "Save as Draft",
      description: `This will save ${recordLabel} as draft.`,
      iconTone: "save" as const,
      pendingLabel: "Saving...",
      title: "Save Petty Cash Voucher as Draft?",
      tone: "default" as const,
    };
  }

  const isEdit = mode === PettyCashVoucherActionModes.Edit;
  return {
    confirmLabel: isEdit ? "Update" : "Save and Submit",
    description: isEdit ? `This will update ${recordLabel}.` : `This will save and submit ${recordLabel}.`,
    iconTone: isEdit ? ("update" as const) : ("save" as const),
    pendingLabel: isEdit ? "Updating..." : "Saving...",
    title: isEdit ? "Update Petty Cash Voucher?" : "Save Petty Cash Voucher?",
    tone: "default" as const,
  };
}

export function getPettyCashVoucherActionTitle(mode: PettyCashVoucherActionMode, voucherNo?: string) {
  if (mode === PettyCashVoucherActionModes.View) return voucherNo ? `View Petty Cash Voucher | ${voucherNo}` : "View Petty Cash Voucher";
  if (mode === PettyCashVoucherActionModes.Edit) return voucherNo ? `Edit Petty Cash Voucher | ${voucherNo}` : "Edit Petty Cash Voucher";
  return "Add Petty Cash Voucher";
}

export const PettyCashVoucherActionDescriptions: Record<PettyCashVoucherActionMode, string> = {
  add: "Complete the voucher header on one page before saving.",
  edit: "Complete the voucher header on one page before saving.",
  view: "Review the voucher details and supporting attachments.",
};
