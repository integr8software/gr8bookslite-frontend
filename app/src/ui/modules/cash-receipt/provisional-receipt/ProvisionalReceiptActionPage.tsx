import {
  ProvisionalReceiptCodeLabel,
  ProvisionalReceiptHref,
  ProvisionalReceiptLabel,
  ProvisionalReceiptStorageKey,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import { OfficialReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptActionPage";
import { ProvisionalReceiptNotFound } from "@/app/src/ui/modules/cash-receipt/provisional-receipt/ProvisionalReceiptNotFound";

export function ProvisionalReceiptActionPage() {
  return (
    <OfficialReceiptActionPage
      baseHref={ProvisionalReceiptHref}
      notFoundFallback={<ProvisionalReceiptNotFound />}
      receiptCodeLabel={ProvisionalReceiptCodeLabel}
      receiptLabel={ProvisionalReceiptLabel}
      storageKey={ProvisionalReceiptStorageKey}
    />
  );
}
