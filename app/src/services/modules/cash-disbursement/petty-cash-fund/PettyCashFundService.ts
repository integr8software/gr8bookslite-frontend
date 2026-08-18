import {
  PettyCashFundStorageKey,
  PettyCashFundTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { PettyCashFundSeedRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type { PettyCashFundRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";

export function getPettyCashFundRecords(): PettyCashFundRecord[] {
  if (typeof window === "undefined") return PettyCashFundSeedRecords;

  try {
    const stored = window.localStorage.getItem(PettyCashFundStorageKey);
    return stored ? (JSON.parse(stored) as PettyCashFundRecord[]) : PettyCashFundSeedRecords;
  } catch {
    return PettyCashFundSeedRecords;
  }
}

export function savePettyCashFundRecords(records: PettyCashFundRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PettyCashFundStorageKey, JSON.stringify(records));
  }
}

export function upsertPettyCashFundRecord(record: PettyCashFundRecord) {
  const records = getPettyCashFundRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

export function createNextPettyCashFundNumber() {
  const highest = getPettyCashFundRecords().reduce(
    (value, record) => Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );

  return `${PettyCashFundTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}
