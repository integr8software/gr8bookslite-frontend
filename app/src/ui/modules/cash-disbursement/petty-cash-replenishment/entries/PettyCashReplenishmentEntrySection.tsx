import type { PettyCashReplenishmentEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { PettyCashReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/entries/PettyCashReplenishmentDetailEntryTable";

export function PettyCashReplenishmentEntrySection({
  onOpenSupplierDrawer,
  page,
}: PettyCashReplenishmentEntrySectionProps) {
  return (
    <PettyCashReplenishmentDetailEntryTable
      onOpenSupplierDrawer={onOpenSupplierDrawer}
      page={page}
    />
  );
}
