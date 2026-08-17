import { ProvisionalReceiptHref } from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function ProvisionalReceiptNotFound() {
  return (
    <ModuleNotFound
      actionHref={ProvisionalReceiptHref}
      actionLabel="Back to Provisional Receipt"
      description="The provisional receipt record may have been removed or is no longer available."
      title="Provisional Receipt Not Found"
    />
  );
}
