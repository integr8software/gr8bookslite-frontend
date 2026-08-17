import {
  RevolvingFundStorageKey,
  RevolvingFundTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { RevolvingFundSeedRecords } from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import type { RevolvingFundRecord } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";

export function getRevolvingFundRecords(): RevolvingFundRecord[] {
  if (typeof window === "undefined") return RevolvingFundSeedRecords;

  try {
    const stored = window.localStorage.getItem(RevolvingFundStorageKey);
    return stored ? (JSON.parse(stored) as RevolvingFundRecord[]) : RevolvingFundSeedRecords;
  } catch {
    return RevolvingFundSeedRecords;
  }
}

export function saveRevolvingFundRecords(records: RevolvingFundRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RevolvingFundStorageKey, JSON.stringify(records));
  }
}

export function upsertRevolvingFundRecord(record: RevolvingFundRecord) {
  const records = getRevolvingFundRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

export function createNextRevolvingFundNumber() {
  const highest = getRevolvingFundRecords().reduce(
    (value, record) => Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );

  return `${RevolvingFundTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}

