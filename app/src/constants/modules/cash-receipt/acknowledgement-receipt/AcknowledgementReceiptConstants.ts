import type { AcknowledgementReceiptStatus } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";

export const AcknowledgementReceiptHref = "/cash-receipt/acknowledgement-receipt";

export const AcknowledgementReceiptStatuses = {
  Active: "Active",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Closed: "Closed",
  Disapproved: "Disapproved",
  Draft: "Draft",
  Pending: "Pending",
} as const satisfies Record<string, AcknowledgementReceiptStatus>;

export const EditableAcknowledgementReceiptStatuses: readonly AcknowledgementReceiptStatus[] = [
  AcknowledgementReceiptStatuses.Active,
  AcknowledgementReceiptStatuses.Draft,
  AcknowledgementReceiptStatuses.Pending,
];

export const AcknowledgementReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: AcknowledgementReceiptStatuses.Active },
  { label: "Pending", value: AcknowledgementReceiptStatuses.Pending },
  { label: "Approved", value: AcknowledgementReceiptStatuses.Approved },
  { label: "Disapproved", value: AcknowledgementReceiptStatuses.Disapproved },
  { label: "Closed", value: AcknowledgementReceiptStatuses.Closed },
  { label: "Cancelled", value: AcknowledgementReceiptStatuses.Cancelled },
] as const;

export const AcknowledgementReceiptStatusFilters = [
  "all",
  AcknowledgementReceiptStatuses.Active,
  AcknowledgementReceiptStatuses.Pending,
  AcknowledgementReceiptStatuses.Approved,
  AcknowledgementReceiptStatuses.Disapproved,
  AcknowledgementReceiptStatuses.Closed,
  AcknowledgementReceiptStatuses.Cancelled,
] as const;

export const AcknowledgementReceiptTablePaginationStorageKey =
  "cash-receipt-acknowledgement-receipt";
