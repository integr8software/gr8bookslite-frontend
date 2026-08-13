import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  PettyCashFundActionTab,
  PettyCashFundEntryTab,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";

export const PettyCashFundHref = getModuleRoute("PCF");
export const PettyCashFundStorageKey = "cash-disbursement-petty-cash-fund-records";
export const PettyCashFundPaginationStorageKey = "cash-disbursement-petty-cash-fund-table";
export const PettyCashFundTransactionPrefix = "PCF";
export const PettyCashFundStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  open: "Open",
  posted: "Posted",
} as const;
export const PettyCashFundRecordStatuses = [
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
] as const satisfies readonly PettyCashFundStatus[];
export const PettyCashFundStatusOptions = ["All", ...PettyCashFundRecordStatuses] as const;
export const PettyCashFundActionTabs: { id: PettyCashFundActionTab; label: string }[] = [
  { id: "details", label: "Petty Cash Fund Details" },
  { id: "attachments", label: "File Attachments" },
];
export const PettyCashFundEntryTabs: { id: PettyCashFundEntryTab; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "accounting", label: "Accounting Entries" },
];
export const PettyCashFundDefaultItemColumnIds = [
  "date",
  "payeeCode",
  "payeeName",
  "orNo",
  "tinNo",
  "particulars",
  "amount",
  "netAmount",
  "vatAmount",
  "type",
  "vatType",
  "vatable",
  "vatInclusive",
  "grossAmount",
  "responsibilityCenter",
];
export const PettyCashFundEntryInputClassName =
  "h-10 w-full min-w-0 border-0 bg-transparent px-3 text-sm text-darknavy outline-none placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03]";

export function canEditPettyCashFund(status: PettyCashFundStatus) {
  return (
    status === PettyCashFundStatuses.draft || status === PettyCashFundStatuses.forApproval || status === PettyCashFundStatuses.disapproved
  );
}
