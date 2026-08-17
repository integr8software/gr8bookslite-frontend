import {
  CollectionReceiptDescription,
  CollectionReceiptHref,
  CollectionReceiptLabel,
  CollectionReceiptStorageKey,
  CollectionReceiptTableTitle,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import { CollectionReceiptFallbackRecords } from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import { OfficialReceiptListPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptListPage";

export function CollectionReceiptListPage() {
  return (
    <OfficialReceiptListPage
      baseHref={CollectionReceiptHref}
      description={CollectionReceiptDescription}
      fallbackReceipts={CollectionReceiptFallbackRecords}
      receiptLabel={CollectionReceiptLabel}
      startNewLabel={`Start New ${CollectionReceiptLabel}`}
      storageKey={CollectionReceiptStorageKey}
      tableTitle={CollectionReceiptTableTitle}
    />
  );
}
