import {
  createInitialBankReconciliationRecords,
} from "@/app/src/data/modules/cash-receipt/bank-reconciliation/BankReconciliationData";
import type {
  BankReconciliationCheckingItem,
  BankReconciliationFormValues,
  BankReconciliationRecord,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";

let inMemoryRecords: BankReconciliationRecord[] =
  createInitialBankReconciliationRecords();

export async function fetchBankReconciliationRecords(): Promise<
  BankReconciliationRecord[]
> {
  return [...inMemoryRecords];
}

export async function fetchBankReconciliationById(
  id: string,
): Promise<BankReconciliationRecord | null> {
  return inMemoryRecords.find((record) => record.id === id) ?? null;
}

export async function createBankReconciliationRecord(
  values: BankReconciliationFormValues,
): Promise<BankReconciliationRecord> {
  const newRecord: BankReconciliationRecord = {
    ...values,
    id: `br-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryRecords = [newRecord, ...inMemoryRecords];
  return newRecord;
}

export async function updateBankReconciliationRecord(
  id: string,
  values: BankReconciliationFormValues,
): Promise<BankReconciliationRecord> {
  const index = inMemoryRecords.findIndex((record) => record.id === id);
  if (index === -1) {
    throw new Error("Bank Reconciliation record not found.");
  }

  const updatedRecord: BankReconciliationRecord = {
    ...values,
    id,
    createdAt: inMemoryRecords[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  inMemoryRecords[index] = updatedRecord;
  return updatedRecord;
}

export async function updateBankReconciliationStatus(
  id: string,
  status: BankReconciliationRecord["status"],
): Promise<BankReconciliationRecord> {
  const record = inMemoryRecords.find((r) => r.id === id);
  if (!record) {
    throw new Error("Bank Reconciliation record not found.");
  }

  record.status = status;
  record.updatedAt = new Date().toISOString();
  return record;
}

export type SmartReconMatchResult = {
  clearedCount: number;
  totalParsed: number;
  updatedItems: BankReconciliationCheckingItem[];
};

export async function parseAndAutoMatchBankStatement(
  _file: File,
  _template: string,
  currentItems: BankReconciliationCheckingItem[],
): Promise<SmartReconMatchResult> {
  // Simulate smart matching engine: matches 2 deposits and 2 checks
  let clearedCount = 0;
  const updatedItems = currentItems.map((item) => {
    // If already cleared, keep it
    if (item.isCleared) {
      return item;
    }

    // Heuristic simulation match for chk-1, chk-2, chk-4, chk-5
    if (["chk-1", "chk-2", "chk-4", "chk-5"].includes(item.id)) {
      clearedCount += 1;
      return {
        ...item,
        isCleared: true,
        isAutoMatched: true,
      };
    }

    return item;
  });

  return {
    clearedCount,
    totalParsed: 4,
    updatedItems,
  };
}
