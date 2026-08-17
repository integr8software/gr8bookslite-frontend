import {
  ProvisionalReceiptCodeLabel,
  ProvisionalReceiptHref,
  ProvisionalReceiptLabel,
  ProvisionalReceiptStorageKey,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import { ProvisionalReceiptFallbackRecords } from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import { OfficialReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptActionPage";
import { ProvisionalReceiptNotFound } from "@/app/src/ui/modules/cash-receipt/provisional-receipt/ProvisionalReceiptNotFound";

export function ProvisionalReceiptActionPage() {
  return (
    <OfficialReceiptActionPage
      baseHref={ProvisionalReceiptHref}
      fallbackReceipts={ProvisionalReceiptFallbackRecords}
      notFoundFallback={<ProvisionalReceiptNotFound />}
      receiptCodeLabel={ProvisionalReceiptCodeLabel}
      receiptLabel={ProvisionalReceiptLabel}
      storageKey={ProvisionalReceiptStorageKey}
    />
  );
}
