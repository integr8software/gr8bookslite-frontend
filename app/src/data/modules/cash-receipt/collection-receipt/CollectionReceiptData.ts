import { MockOfficialReceipts } from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { CollectionReceiptRecord } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

export const CollectionReceiptFallbackRecords: CollectionReceiptRecord[] = MockOfficialReceipts.map((record, index) => ({
  ...record,
  id: `cr-${String(index + 1).padStart(3, "0")}`,
  receiptNo: record.receiptNo.replace("OR", "CR"),
  formValues: record.formValues
    ? {
        ...record.formValues,
        receiptNo: record.formValues.receiptNo.replace("OR", "CR"),
        lineEntries: record.formValues.lineEntries.map((entry) => ({
          ...entry,
        })),
      }
    : undefined,
}));
