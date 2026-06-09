import type {
  PettyCashFundReplenishmentCopySource,
  PettyCashFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";

export const PettyCashFundReplenishmentHref =
  "/cash-disbursement/petty-cash-fund-replenishment";

export const PettyCashFundReplenishmentPaginationStorageKey =
  "petty-cash-fund-replenishment-table";

export const PettyCashFundReplenishmentStatusOptions: Array<
  "All" | PettyCashFundReplenishmentStatus
> = ["All", "Active", "Pending", "Closed"];

export const PettyCashFundReplenishmentFormStatusOptions: PettyCashFundReplenishmentStatus[] =
  ["Active", "Pending", "Closed"];

export const PettyCashFundReplenishmentCopySources: PettyCashFundReplenishmentCopySource[] =
  ["Petty Cash Voucher", "Petty Cash Fund"];
