import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceCostCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";

export const CashAdvanceMultipleEntryHref = getModuleRoute("CAME");

export const CashAdvanceMultipleEntryTablePaginationStorageKey =
  "cash-disbursement-cash-advance-multiple-entry";

export const CashAdvanceMultipleEntryStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  posted: "Posted",
} as const;

export const CashAdvanceMultipleEntryStatusFilterOptions = [
  { label: "All statuses", value: "all" },
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
  "all",
  CashAdvanceMultipleEntryStatuses.draft,
  CashAdvanceMultipleEntryStatuses.forApproval,
  CashAdvanceMultipleEntryStatuses.posted,
  CashAdvanceMultipleEntryStatuses.disapproved,
  CashAdvanceMultipleEntryStatuses.cancelled,
] as const;

export {
  CashAdvanceAccountOptions as CashAdvanceMultipleEntryAccountOptions,
  CashAdvanceCostCenterOptions as CashAdvanceMultipleEntryCostCenterOptions,
};
