"use client";

import {
  CollectionReceiptDescription,
  CollectionReceiptHref,
  CollectionReceiptLabel,
  CollectionReceiptStorageKey,
  CollectionReceiptTableTitle,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import { OfficialReceiptListPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/overview/OfficialReceiptListPage";

export function CollectionReceiptListPage() {
  return (
    <OfficialReceiptListPage
      baseHref={CollectionReceiptHref}
      description={CollectionReceiptDescription}
      receiptLabel={CollectionReceiptLabel}
      startNewLabel={`Start New ${CollectionReceiptLabel}`}
      storageKey={CollectionReceiptStorageKey}
      tableTitle={CollectionReceiptTableTitle}
    />
  );
}
