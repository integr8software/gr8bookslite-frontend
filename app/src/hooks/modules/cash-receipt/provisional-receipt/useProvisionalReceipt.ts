import { ProvisionalReceiptStorageKey } from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import { ProvisionalReceiptFallbackRecords } from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import {
  useOfficialReceiptActionForm,
  useOfficialReceiptStore,
  useOfficialReceiptTable,
} from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceipt";
import type {
  ProvisionalReceiptActionMode,
  ProvisionalReceiptRecord,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";

const ProvisionalReceiptHookConfig = {
  fallbackReceipts: ProvisionalReceiptFallbackRecords,
  receiptLabel: "provisional receipt",
  storageKey: ProvisionalReceiptStorageKey,
};

export function useProvisionalReceiptStore() {
  return useOfficialReceiptStore(undefined, ProvisionalReceiptHookConfig);
}

export function useProvisionalReceiptActionForm(
  mode: ProvisionalReceiptActionMode,
  recordId?: string,
  onSaved?: (record: ProvisionalReceiptRecord) => void,
) {
  return useOfficialReceiptActionForm(mode, recordId, onSaved, ProvisionalReceiptHookConfig);
}

export function useProvisionalReceiptTable(records: ProvisionalReceiptRecord[]) {
  return useOfficialReceiptTable(records);
}
