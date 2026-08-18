import {
  RevolvingFundReplenishmentStorageKey,
  RevolvingFundReplenishmentTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { RevolvingFundReplenishmentSeedRecords } from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import type { RevolvingFundReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";

export function getRevolvingFundReplenishmentRecords(): RevolvingFundReplenishmentRecord[] {
  if (typeof window === "undefined") return RevolvingFundReplenishmentSeedRecords;
  try {
    const stored = window.localStorage.getItem(RevolvingFundReplenishmentStorageKey);
    return stored ? (JSON.parse(stored) as RevolvingFundReplenishmentRecord[]) : RevolvingFundReplenishmentSeedRecords;
  } catch {
    return RevolvingFundReplenishmentSeedRecords;
  }
}

export function saveRevolvingFundReplenishmentRecords(records: RevolvingFundReplenishmentRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RevolvingFundReplenishmentStorageKey, JSON.stringify(records));
  }
}

export function upsertRevolvingFundReplenishmentRecord(record: RevolvingFundReplenishmentRecord) {
  const records = getRevolvingFundReplenishmentRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

export function createNextRevolvingFundReplenishmentNumber() {
  const highest = getRevolvingFundReplenishmentRecords().reduce(
    (value, record) => Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );
  return `${RevolvingFundReplenishmentTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}
