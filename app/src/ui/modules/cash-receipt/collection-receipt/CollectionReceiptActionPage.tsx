import {
  CollectionReceiptCodeLabel,
  CollectionReceiptHref,
  CollectionReceiptLabel,
  CollectionReceiptStorageKey,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import { CollectionReceiptFallbackRecords } from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import { CollectionReceiptNotFound } from "@/app/src/ui/modules/cash-receipt/collection-receipt/CollectionReceiptNotFound";
import { OfficialReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptActionPage";

export function CollectionReceiptActionPage() {
  return (
    <OfficialReceiptActionPage
      baseHref={CollectionReceiptHref}
      fallbackReceipts={CollectionReceiptFallbackRecords}
      notFoundFallback={<CollectionReceiptNotFound />}
      receiptCodeLabel={CollectionReceiptCodeLabel}
      receiptLabel={CollectionReceiptLabel}
      storageKey={CollectionReceiptStorageKey}
    />
  );
}
