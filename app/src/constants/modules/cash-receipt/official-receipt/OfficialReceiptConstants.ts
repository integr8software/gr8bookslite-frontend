import type { OfficialReceiptStatus } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";

export const OfficialReceiptHref = "/cash-receipt/official-receipt";

export const OfficialReceiptStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Posted: "Posted",
} as const satisfies Record<string, OfficialReceiptStatus>;

export const EditableOfficialReceiptStatuses: readonly OfficialReceiptStatus[] = [
  OfficialReceiptStatuses.Draft,
  OfficialReceiptStatuses.ForApproval,
];

export const OfficialReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: OfficialReceiptStatuses.Draft },
  { label: "For Approval", value: OfficialReceiptStatuses.ForApproval },
  { label: "Posted", value: OfficialReceiptStatuses.Posted },
  { label: "Disapproved", value: OfficialReceiptStatuses.Disapproved },
  { label: "Cancelled", value: OfficialReceiptStatuses.Cancelled },
] as const;

export const OfficialReceiptStatusFilters = [
  "all",
  OfficialReceiptStatuses.Draft,
  OfficialReceiptStatuses.ForApproval,
  OfficialReceiptStatuses.Posted,
  OfficialReceiptStatuses.Disapproved,
  OfficialReceiptStatuses.Cancelled,
] as const;

export const OfficialReceiptTablePaginationStorageKey =
  "cash-receipt-official-receipt";

export const OfficialReceiptActionTabs = [
  { id: "details", label: "Details" },
  { id: "attachments", label: "Attachments" },
] as const;

