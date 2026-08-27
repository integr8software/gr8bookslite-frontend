import type { RevolvingFundReplenishmentEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentDetailEntryTable";

export function RevolvingFundReplenishmentEntrySection({
  onOpenSupplierDrawer,
  page,
}: RevolvingFundReplenishmentEntrySectionProps) {
  return (
    <RevolvingFundReplenishmentDetailEntryTable
      onOpenSupplierDrawer={onOpenSupplierDrawer}
      page={page}
    />
  );
}
