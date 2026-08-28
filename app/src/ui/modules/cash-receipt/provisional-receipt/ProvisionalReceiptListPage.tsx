import {
  ProvisionalReceiptDescription,
  ProvisionalReceiptHref,
  ProvisionalReceiptLabel,
  ProvisionalReceiptStorageKey,
  ProvisionalReceiptTableTitle,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import { OfficialReceiptListPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/overview/OfficialReceiptListPage";

export function ProvisionalReceiptListPage() {
  return (
    <OfficialReceiptListPage
      baseHref={ProvisionalReceiptHref}
      description={ProvisionalReceiptDescription}
      receiptLabel={ProvisionalReceiptLabel}
      startNewLabel={`Start New ${ProvisionalReceiptLabel}`}
      storageKey={ProvisionalReceiptStorageKey}
      tableTitle={ProvisionalReceiptTableTitle}
    />
  );
}
