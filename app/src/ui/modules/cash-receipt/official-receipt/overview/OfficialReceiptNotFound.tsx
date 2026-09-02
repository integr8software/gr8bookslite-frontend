import { OfficialReceiptHref } from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function OfficialReceiptNotFound() {
  return (
    <ModuleNotFound
      actionHref={OfficialReceiptHref}
      actionLabel="Back to Official Receipt"
      description="The official receipt record may have been removed or is no longer available."
      title="Official Receipt Not Found"
    />
  );
}
