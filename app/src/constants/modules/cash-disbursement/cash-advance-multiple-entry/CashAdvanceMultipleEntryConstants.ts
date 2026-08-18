import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceCostCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { CashDisbursementOverviewActionColumnWidth } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import type { ColumnOrderState, VisibilityState } from "@tanstack/react-table";
import type {
  CashAdvanceMultipleEntryDetailsTab,
  CashAdvanceMultipleEntryTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";

export const CashAdvanceMultipleEntryHref = getModuleRoute("CAME");
export const CashAdvanceMultipleEntryStorageKey = "gr8books.cash-advance-multiple-entry.records";
export const CashAdvanceMultipleEntryTransactionNumberPrefix = "CAME-";
export const CashAdvanceMultipleEntryTransactionNumberPadding = 6;

export const CashAdvanceMultipleEntryTablePaginationStorageKey = "cash-disbursement-cash-advance-multiple-entry";

export const CashAdvanceMultipleEntryOverviewColumnWidths = {
  ...TransactionOverviewColumnWidths,
  transactionNumber: 280,
  amount: 210,
  status: 120,
  actions: CashDisbursementOverviewActionColumnWidth,
} as const;

export const CashAdvanceMultipleEntryStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;

export const CashAdvanceMultipleEntryAllStatusFilter = "all";

export const CashAdvanceMultipleEntryDefaultColumnVisibility: VisibilityState = {
  accountCode: false,
  createdAt: false,
  createdBy: false,
  partyCode: false,
  remarks: false,
  updatedAt: false,
  updatedBy: false,
};

export const CashAdvanceMultipleEntryDefaultColumnOrder: ColumnOrderState = [
  "transNo",
  "documentDate",
  "partyCode",
  "partyName",
  "accountCode",
  "accountTitle",
  "amount",
  "remarks",
  "createdBy",
  "createdAt",
  "updatedBy",
  "updatedAt",
  "status",
  "actions",
];

export const CashAdvanceMultipleEntryStatusFilterOptions = [
  { label: "All statuses", value: CashAdvanceMultipleEntryAllStatusFilter },
  {
    label: CashAdvanceMultipleEntryStatuses.draft,
    value: CashAdvanceMultipleEntryStatuses.draft,
  },
  {
    label: CashAdvanceMultipleEntryStatuses.forApproval,
    value: CashAdvanceMultipleEntryStatuses.forApproval,
  },
  { label: CashAdvanceMultipleEntryStatuses.posted, value: CashAdvanceMultipleEntryStatuses.posted },
  {
    label: CashAdvanceMultipleEntryStatuses.disapproved,
    value: CashAdvanceMultipleEntryStatuses.disapproved,
  },
  {
    label: CashAdvanceMultipleEntryStatuses.cancelled,
    value: CashAdvanceMultipleEntryStatuses.cancelled,
  },
] as const;

export const CashAdvanceMultipleEntryStatusFilters = [
  CashAdvanceMultipleEntryAllStatusFilter,
  CashAdvanceMultipleEntryStatuses.draft,
  CashAdvanceMultipleEntryStatuses.forApproval,
  CashAdvanceMultipleEntryStatuses.posted,
  CashAdvanceMultipleEntryStatuses.disapproved,
  CashAdvanceMultipleEntryStatuses.cancelled,
] as const;

export const CashAdvanceMultipleEntryDetailsTabs: {
  id: CashAdvanceMultipleEntryDetailsTab;
  label: string;
}[] = [
  { id: "details", label: "Cash Advance Details" },
  { id: "attachment", label: "File Attachments" },
];

export const CashAdvanceMultipleEntryEntryTabs: {
  id: CashAdvanceMultipleEntryTab;
  label: string;
}[] = [
  { id: "items", label: "Item Details" },
  { id: "accounting", label: "Accounting Entries" },
];

export const CashAdvanceMultipleEntryDefaultItemColumnIds = [
  "partyName",
  "amount",
  "cashAdvanceBalance",
  "responsibilityCenter",
  "particulars",
];

export const CashAdvanceMultipleEntryDefaultAccountingColumnIds = ["accountTitle", "credit", "debit", "partyName"];

export const CashAdvanceMultipleEntryFieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

export const CashAdvanceMultipleEntryReadOnlyFieldClassName =
  "app-data-entry-field transaction-readonly-placeholder h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-darknavy/5 px-3 text-sm font-medium text-darknavy/60 outline-none placeholder:text-darknavy/35";

export const CashAdvanceMultipleEntryEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 read-only:text-darknavy focus:ring-2 focus:ring-inset focus:ring-skyblue/35";

export const CashAdvanceMultipleEntryEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export {
  CashAdvanceAccountOptions as CashAdvanceMultipleEntryAccountOptions,
  CashAdvanceCostCenterOptions as CashAdvanceMultipleEntryCostCenterOptions,
};
