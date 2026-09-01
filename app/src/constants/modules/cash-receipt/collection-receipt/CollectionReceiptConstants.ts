import type { CollectionReceiptStatus } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

export const CollectionReceiptHref = "/cash-receipt/collection-receipt";

export const CollectionReceiptStatuses = {
  Cancelled: "Cancelled",
  Disapproved: "Disapproved",
  Draft: "Draft",
  ForApproval: "For Approval",
  Posted: "Posted",
} as const satisfies Record<string, CollectionReceiptStatus>;

export const EditableCollectionReceiptStatuses: readonly CollectionReceiptStatus[] = [
  CollectionReceiptStatuses.Draft,
  CollectionReceiptStatuses.ForApproval,
];

export const CollectionReceiptStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: CollectionReceiptStatuses.Draft },
  { label: "For Approval", value: CollectionReceiptStatuses.ForApproval },
  { label: "Posted", value: CollectionReceiptStatuses.Posted },
  { label: "Disapproved", value: CollectionReceiptStatuses.Disapproved },
  { label: "Cancelled", value: CollectionReceiptStatuses.Cancelled },
] as const;

export const CollectionReceiptStatusFilters = [
  "all",
  CollectionReceiptStatuses.Draft,
  CollectionReceiptStatuses.ForApproval,
  CollectionReceiptStatuses.Posted,
  CollectionReceiptStatuses.Disapproved,
  CollectionReceiptStatuses.Cancelled,
] as const;

export const CollectionReceiptTablePaginationStorageKey = "cash-receipt-collection-receipt";

export const CollectionReceiptActionTabs = [
  { id: "details", label: "Details" },
  { id: "attachments", label: "Attachments" },
] as const;

export const CollectionReceiptStorageKey = "gr8books.collection-receipt.receipts";
export const CollectionReceiptCodeLabel = "CR";
export const CollectionReceiptLabel = "Collection Receipt";
export const CollectionReceiptDescription =
  "Search collection receipt transactions, review linked parties, and create or update collection entries.";
export const CollectionReceiptTableTitle = "Collection receipt entries";
