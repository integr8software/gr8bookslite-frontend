import type { PettyCashFundReplenishmentEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { PettyCashFundReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentDetailEntryTable";

export function PettyCashFundReplenishmentEntrySection({
  page,
}: PettyCashFundReplenishmentEntrySectionProps) {
  return <PettyCashFundReplenishmentDetailEntryTable page={page} />;
}
