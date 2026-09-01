import type { ProvisionalReceiptStatus } from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";

export const ProvisionalReceiptHref = "/cash-receipt/provisional-receipt";

export const ProvisionalReceiptStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Posted: "Posted",
} as const satisfies Record<string, ProvisionalReceiptStatus>;

export const EditableProvisionalReceiptStatuses: readonly ProvisionalReceiptStatus[] = [
  ProvisionalReceiptStatuses.Draft,
  ProvisionalReceiptStatuses.ForApproval,
];

export const ProvisionalReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: ProvisionalReceiptStatuses.Draft },
  { label: "For Approval", value: ProvisionalReceiptStatuses.ForApproval },
  { label: "Posted", value: ProvisionalReceiptStatuses.Posted },
  { label: "Disapproved", value: ProvisionalReceiptStatuses.Disapproved },
  { label: "Cancelled", value: ProvisionalReceiptStatuses.Cancelled },
] as const;

export const ProvisionalReceiptStatusFilters = [
  "all",
  ProvisionalReceiptStatuses.Draft,
  ProvisionalReceiptStatuses.ForApproval,
  ProvisionalReceiptStatuses.Posted,
  ProvisionalReceiptStatuses.Disapproved,
  ProvisionalReceiptStatuses.Cancelled,
] as const;

export const ProvisionalReceiptTablePaginationStorageKey = "cash-receipt-provisional-receipt";

export const ProvisionalReceiptActionTabs = [
  { id: "details", label: "Details" },
  { id: "attachments", label: "Attachments" },
] as const;

export const ProvisionalReceiptStorageKey = "gr8books.provisional-receipt.receipts";
export const ProvisionalReceiptCodeLabel = "PVR";
export const ProvisionalReceiptLabel = "Collection Receipt";
export const ProvisionalReceiptDescription =
  "Search provisional receipt transactions, review linked parties, and create or update collection entries.";
export const ProvisionalReceiptTableTitle = "Provisional receipt entries";
