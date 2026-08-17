import {
  ProvisionalReceiptDescription,
  ProvisionalReceiptHref,
  ProvisionalReceiptLabel,
  ProvisionalReceiptStorageKey,
  ProvisionalReceiptTableTitle,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import { ProvisionalReceiptFallbackRecords } from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import { OfficialReceiptListPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptListPage";

export function ProvisionalReceiptListPage() {
  return (
    <OfficialReceiptListPage
      baseHref={ProvisionalReceiptHref}
      description={ProvisionalReceiptDescription}
      fallbackReceipts={ProvisionalReceiptFallbackRecords}
      receiptLabel={ProvisionalReceiptLabel}
      startNewLabel={`Start New ${ProvisionalReceiptLabel}`}
      storageKey={ProvisionalReceiptStorageKey}
      tableTitle={ProvisionalReceiptTableTitle}
    />
  );
}
