export const AcknowledgementReceiptHref = "/cash-receipt/acknowledgement-receipt";

export const AcknowledgementReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Disapproved", value: "Disapproved" },
  { label: "Closed", value: "Closed" },
  { label: "Cancelled", value: "Cancelled" },
] as const;

export const AcknowledgementReceiptStatusFilters = [
  "all",
  "Active",
  "Pending",
  "Approved",
  "Disapproved",
  "Closed",
  "Cancelled",
] as const;

export const AcknowledgementReceiptTablePaginationStorageKey =
  "cash-receipt-acknowledgement-receipt";
