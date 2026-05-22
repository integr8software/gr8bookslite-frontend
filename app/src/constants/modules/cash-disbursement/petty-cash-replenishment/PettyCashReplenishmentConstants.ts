import type {
  PettyCashReplenishmentCopySource,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

export const PettyCashReplenishmentHref =
  "/cash-disbursement/petty-cash-replenishment";

export const PettyCashReplenishmentPaginationStorageKey =
  "petty-cash-replenishment-table";

export const PettyCashReplenishmentStatusOptions: Array<
  "All" | PettyCashReplenishmentStatus
> = ["All", "Active", "Pending", "Closed"];

export const PettyCashReplenishmentFormStatusOptions: PettyCashReplenishmentStatus[] =
  ["Active", "Pending", "Closed"];

export const PettyCashReplenishmentCopySources: PettyCashReplenishmentCopySource[] =
  ["Petty Cash Voucher", "Petty Cash Fund"];
