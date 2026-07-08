export const OfficialReceiptHref = "/cash-receipt/official-receipt";

export const OfficialReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Disapproved", value: "Disapproved" },
  { label: "Closed", value: "Closed" },
  { label: "Cancelled", value: "Cancelled" },
] as const;

export const OfficialReceiptStatusFilters = [
  "all",
  "Active",
  "Pending",
  "Approved",
  "Disapproved",
  "Closed",
  "Cancelled",
] as const;

export const OfficialReceiptTablePaginationStorageKey =
  "cash-receipt-official-receipt";
