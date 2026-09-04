import {
  RequestForPaymentStorageKey,
  RequestForPaymentTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import { RequestForPaymentSeedRecords } from "@/app/src/data/modules/cash-disbursement/request-for-payment/RequestForPaymentData";
import type {
  RequestForPaymentRecord,
  RequestForPaymentStatus,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";

export function getRequestForPaymentRecords(): RequestForPaymentRecord[] {
  if (typeof window === "undefined") return RequestForPaymentSeedRecords;

  try {
    const stored = window.localStorage.getItem(RequestForPaymentStorageKey);
    return stored ? (JSON.parse(stored) as RequestForPaymentRecord[]) : RequestForPaymentSeedRecords;
  } catch {
    return RequestForPaymentSeedRecords;
  }
}

export function saveRequestForPaymentRecords(records: RequestForPaymentRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RequestForPaymentStorageKey, JSON.stringify(records));
  }
}

export function upsertRequestForPaymentRecord(record: RequestForPaymentRecord) {
  const records = getRequestForPaymentRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

export function updateRequestForPaymentStatus(id: string, status: RequestForPaymentStatus): RequestForPaymentRecord[] {
  const records = getRequestForPaymentRecords();
  const updated = records.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
  saveRequestForPaymentRecords(updated);
  return updated;
}

export function deleteRequestForPaymentRecord(id: string): RequestForPaymentRecord[] {
  const records = getRequestForPaymentRecords();
  const updated = records.filter((item) => item.id !== id);
  saveRequestForPaymentRecords(updated);
  return updated;
}

export function createNextRequestForPaymentNumber() {
  const highest = getRequestForPaymentRecords().reduce(
    (value, record) => Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );

  return `${RequestForPaymentTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}
