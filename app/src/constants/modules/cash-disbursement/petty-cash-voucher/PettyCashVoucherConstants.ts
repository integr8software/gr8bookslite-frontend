import type { PettyCashVoucherStatus } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

export const PettyCashVoucherHref = "/cash-disbursement/petty-cash-voucher";

export const PettyCashVoucherPaginationStorageKey =
  "petty-cash-voucher-table";

export const PettyCashVoucherStatusOptions: Array<
  "All" | PettyCashVoucherStatus
> = ["All", "Pending", "Approved", "Cancelled"];
