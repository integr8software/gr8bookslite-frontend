import type { OfficialReceiptStatus } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";

export const OfficialReceiptHref = "/cash-receipt/official-receipt";

export const OfficialReceiptStatuses = {
  Active: "Active",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Closed: "Closed",
  Disapproved: "Disapproved",
  Draft: "Draft",
  Pending: "Pending",
} as const satisfies Record<string, OfficialReceiptStatus>;

export const EditableOfficialReceiptStatuses: readonly OfficialReceiptStatus[] = [
  OfficialReceiptStatuses.Active,
  OfficialReceiptStatuses.Draft,
  OfficialReceiptStatuses.Pending,
];

export const OfficialReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: OfficialReceiptStatuses.Active },
  { label: "Pending", value: OfficialReceiptStatuses.Pending },
  { label: "Approved", value: OfficialReceiptStatuses.Approved },
  { label: "Disapproved", value: OfficialReceiptStatuses.Disapproved },
  { label: "Closed", value: OfficialReceiptStatuses.Closed },
  { label: "Cancelled", value: OfficialReceiptStatuses.Cancelled },
] as const;

export const OfficialReceiptStatusFilters = [
  "all",
  OfficialReceiptStatuses.Active,
  OfficialReceiptStatuses.Pending,
  OfficialReceiptStatuses.Approved,
  OfficialReceiptStatuses.Disapproved,
  OfficialReceiptStatuses.Closed,
  OfficialReceiptStatuses.Cancelled,
] as const;

export const OfficialReceiptTablePaginationStorageKey =
  "cash-receipt-official-receipt";
