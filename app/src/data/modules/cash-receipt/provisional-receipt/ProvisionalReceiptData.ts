import { MockOfficialReceipts } from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { ProvisionalReceiptRecord } from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";

export const ProvisionalReceiptFallbackRecords: ProvisionalReceiptRecord[] = MockOfficialReceipts.map((record, index) => ({
  ...record,
  id: `pvr-${String(index + 1).padStart(3, "0")}`,
  receiptNo: record.receiptNo.replace("OR", "PVR"),
  formValues: record.formValues
    ? {
        ...record.formValues,
        receiptNo: record.formValues.receiptNo.replace("OR", "PVR"),
        lineEntries: record.formValues.lineEntries.map((entry) => ({
          ...entry,
        })),
      }
    : undefined,
}));
