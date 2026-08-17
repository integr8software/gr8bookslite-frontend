import {
  AdvancesToSuppliersStorageKey,
  AdvancesToSuppliersTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import { AdvancesToSuppliersSeedRecords } from "@/app/src/data/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersData";
import type { AdvancesToSuppliersRecord } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";

export function getAdvancesToSuppliersRecords(): AdvancesToSuppliersRecord[] {
  if (typeof window === "undefined") return AdvancesToSuppliersSeedRecords;
  try {
    const stored = window.localStorage.getItem(AdvancesToSuppliersStorageKey);
    return stored
      ? (JSON.parse(stored) as AdvancesToSuppliersRecord[])
      : AdvancesToSuppliersSeedRecords;
  } catch {
    return AdvancesToSuppliersSeedRecords;
  }
}

export function saveAdvancesToSuppliersRecords(
  records: AdvancesToSuppliersRecord[],
) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      AdvancesToSuppliersStorageKey,
      JSON.stringify(records),
    );
  }
}

export function upsertAdvancesToSuppliersRecord(
  record: AdvancesToSuppliersRecord,
) {
  const records = getAdvancesToSuppliersRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

export function createNextAdvancesToSuppliersNumber() {
  const highest = getAdvancesToSuppliersRecords().reduce(
    (value, record) =>
      Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );
  return `${AdvancesToSuppliersTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}


