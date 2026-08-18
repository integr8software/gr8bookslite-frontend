import {
  PettyCashFundReplenishmentStorageKey,
  PettyCashFundReplenishmentTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { PettyCashFundReplenishmentSeedRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import type { PettyCashFundReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";

export function getPettyCashFundReplenishmentRecords(): PettyCashFundReplenishmentRecord[] {
  if (typeof window === "undefined") return PettyCashFundReplenishmentSeedRecords;
  try {
    const stored = window.localStorage.getItem(PettyCashFundReplenishmentStorageKey);
    return stored ? (JSON.parse(stored) as PettyCashFundReplenishmentRecord[]) : PettyCashFundReplenishmentSeedRecords;
  } catch {
    return PettyCashFundReplenishmentSeedRecords;
  }
}

export function savePettyCashFundReplenishmentRecords(records: PettyCashFundReplenishmentRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PettyCashFundReplenishmentStorageKey, JSON.stringify(records));
  }
}

export function upsertPettyCashFundReplenishmentRecord(record: PettyCashFundReplenishmentRecord) {
  const records = getPettyCashFundReplenishmentRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

export function createNextPettyCashFundReplenishmentNumber() {
  const highest = getPettyCashFundReplenishmentRecords().reduce(
    (value, record) => Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );
  return `${PettyCashFundReplenishmentTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}
