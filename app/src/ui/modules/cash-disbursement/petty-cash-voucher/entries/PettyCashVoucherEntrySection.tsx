import type { PettyCashVoucherEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { PettyCashVoucherDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/entries/PettyCashVoucherDetailEntryTable";

export function PettyCashVoucherEntrySection({
  onOpenResponsibilityCenterDrawer,
  onOpenSupplierDrawer,
  page,
}: PettyCashVoucherEntrySectionProps) {
  return (
    <PettyCashVoucherDetailEntryTable
      page={page}
      onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer}
      onOpenSupplierDrawer={onOpenSupplierDrawer}
    />
  );
}
