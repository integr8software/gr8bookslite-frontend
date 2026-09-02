import { AcknowledgementReceiptHref } from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function AcknowledgementReceiptNotFound() {
  return (
    <ModuleNotFound
      actionHref={AcknowledgementReceiptHref}
      actionLabel="Back to Collection Receipt"
      description="The acknowledgement receipt record may have been removed or is no longer available."
      title="Collection Receipt Not Found"
    />
  );
}
