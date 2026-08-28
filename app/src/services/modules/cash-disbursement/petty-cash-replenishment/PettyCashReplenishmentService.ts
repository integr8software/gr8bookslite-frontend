import {
  PettyCashReplenishmentStorageKey,
  PettyCashReplenishmentTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { PettyCashReplenishmentSeedRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import type { PettyCashReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

export function getPettyCashReplenishmentRecords(): PettyCashReplenishmentRecord[] {
  if (typeof window === "undefined") return PettyCashReplenishmentSeedRecords;
  try {
    const stored = window.localStorage.getItem(PettyCashReplenishmentStorageKey);
    return stored ? (JSON.parse(stored) as PettyCashReplenishmentRecord[]) : PettyCashReplenishmentSeedRecords;
  } catch {
    return PettyCashReplenishmentSeedRecords;
  }
}

export function savePettyCashReplenishmentRecords(records: PettyCashReplenishmentRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PettyCashReplenishmentStorageKey, JSON.stringify(records));
  }
}

export function upsertPettyCashReplenishmentRecord(record: PettyCashReplenishmentRecord) {
  const records = getPettyCashReplenishmentRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

export function createNextPettyCashReplenishmentNumber() {
  const highest = getPettyCashReplenishmentRecords().reduce(
    (value, record) => Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );
  return `${PettyCashReplenishmentTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}
