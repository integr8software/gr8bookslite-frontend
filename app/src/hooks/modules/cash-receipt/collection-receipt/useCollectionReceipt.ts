import { CollectionReceiptStorageKey } from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import { CollectionReceiptFallbackRecords } from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import {
  useOfficialReceiptActionForm,
  useOfficialReceiptStore,
  useOfficialReceiptTable,
} from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceipt";
import type {
  CollectionReceiptActionMode,
  CollectionReceiptRecord,
} from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

const CollectionReceiptHookConfig = {
  fallbackReceipts: CollectionReceiptFallbackRecords,
  receiptLabel: "collection receipt",
  storageKey: CollectionReceiptStorageKey,
};

export function useCollectionReceiptStore() {
  return useOfficialReceiptStore(undefined, CollectionReceiptHookConfig);
}

export function useCollectionReceiptActionForm(
  mode: CollectionReceiptActionMode,
  recordId?: string,
  onSaved?: (record: CollectionReceiptRecord) => void,
) {
  return useOfficialReceiptActionForm(mode, recordId, onSaved, CollectionReceiptHookConfig);
}

export function useCollectionReceiptTable(records: CollectionReceiptRecord[]) {
  return useOfficialReceiptTable(records);
}
