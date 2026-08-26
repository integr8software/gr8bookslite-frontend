"use client";

import {
  CollectionReceiptDescription,
  CollectionReceiptHref,
  CollectionReceiptLabel,
  CollectionReceiptStorageKey,
  CollectionReceiptTableTitle,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import { CollectionReceiptHookConfig } from "@/app/src/hooks/modules/cash-receipt/collection-receipt/useCollectionReceipt";
import { OfficialReceiptListPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptListPage";

export function CollectionReceiptListPage() {
  return (
    <OfficialReceiptListPage
      api={CollectionReceiptHookConfig.api}
      baseHref={CollectionReceiptHref}
      description={CollectionReceiptDescription}
      receiptLabel={CollectionReceiptLabel}
      startNewLabel={`Start New ${CollectionReceiptLabel}`}
      storageKey={CollectionReceiptStorageKey}
      tableTitle={CollectionReceiptTableTitle}
    />
  );
}
