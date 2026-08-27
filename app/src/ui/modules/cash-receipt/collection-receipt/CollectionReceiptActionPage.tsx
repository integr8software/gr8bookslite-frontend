"use client";

import {
  CollectionReceiptCodeLabel,
  CollectionReceiptHref,
  CollectionReceiptLabel,
  CollectionReceiptStorageKey,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import { CollectionReceiptHookConfig } from "@/app/src/hooks/modules/cash-receipt/collection-receipt/useCollectionReceipt";
import { CollectionReceiptNotFound } from "@/app/src/ui/modules/cash-receipt/collection-receipt/CollectionReceiptNotFound";
import { OfficialReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptActionPage";

export function CollectionReceiptActionPage() {
  return (
    <OfficialReceiptActionPage
      api={CollectionReceiptHookConfig.api}
      baseHref={CollectionReceiptHref}
      notFoundFallback={<CollectionReceiptNotFound />}
      receiptCodeLabel={CollectionReceiptCodeLabel}
      receiptLabel={CollectionReceiptLabel}
      storageKey={CollectionReceiptStorageKey}
    />
  );
}
