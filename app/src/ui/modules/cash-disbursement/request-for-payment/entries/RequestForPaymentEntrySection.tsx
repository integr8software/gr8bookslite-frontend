import type { RequestForPaymentEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { RequestForPaymentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/entries/RequestForPaymentDetailEntryTable";

export function RequestForPaymentEntrySection({
  onOpenResponsibilityCenterDrawer,
  onOpenSupplierDrawer,
  page,
}: RequestForPaymentEntrySectionProps) {
  return (
    <RequestForPaymentDetailEntryTable
      page={page}
      onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer}
      onOpenSupplierDrawer={onOpenSupplierDrawer}
    />
  );
}
