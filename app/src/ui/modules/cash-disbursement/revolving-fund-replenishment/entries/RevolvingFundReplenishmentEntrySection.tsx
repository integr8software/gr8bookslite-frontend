import type { RevolvingFundReplenishmentEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentDetailEntryTable";

export function RevolvingFundReplenishmentEntrySection({
  page,
}: RevolvingFundReplenishmentEntrySectionProps) {
  return <RevolvingFundReplenishmentDetailEntryTable page={page} />;
}
