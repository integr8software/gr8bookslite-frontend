import type { AcknowledgementReceiptStatus } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";

export const AcknowledgementReceiptHref = "/cash-receipt/acknowledgement-receipt";

export const AcknowledgementReceiptStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Posted: "Posted",
} as const satisfies Record<string, AcknowledgementReceiptStatus>;

export const EditableAcknowledgementReceiptStatuses: readonly AcknowledgementReceiptStatus[] = [
  AcknowledgementReceiptStatuses.Draft,
  AcknowledgementReceiptStatuses.ForApproval,
];

export const AcknowledgementReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: AcknowledgementReceiptStatuses.Draft },
  { label: "For Approval", value: AcknowledgementReceiptStatuses.ForApproval },
  { label: "Posted", value: AcknowledgementReceiptStatuses.Posted },
  { label: "Disapproved", value: AcknowledgementReceiptStatuses.Disapproved },
  { label: "Cancelled", value: AcknowledgementReceiptStatuses.Cancelled },
] as const;

export const AcknowledgementReceiptStatusFilters = [
  "all",
  AcknowledgementReceiptStatuses.Draft,
  AcknowledgementReceiptStatuses.ForApproval,
  AcknowledgementReceiptStatuses.Posted,
  AcknowledgementReceiptStatuses.Disapproved,
  AcknowledgementReceiptStatuses.Cancelled,
] as const;

export const AcknowledgementReceiptTablePaginationStorageKey = "cash-receipt-acknowledgement-receipt";

export const AcknowledgementReceiptActionTabs = [
  { id: "details", label: "Details" },
  { id: "attachments", label: "Attachments" },
] as const;

export const AcknowledgementReceiptStorageKey = "gr8books.acknowledgement-receipt.receipts";
export const AcknowledgementReceiptCodeLabel = "AR";
export const AcknowledgementReceiptLabel = "Collection Receipt";
export const AcknowledgementReceiptDescription =
  "Search acknowledgement receipt transactions, review linked parties, and create or update collection entries.";
export const AcknowledgementReceiptTableTitle = "Acknowledgement receipt entries";
