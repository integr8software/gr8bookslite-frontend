"use client";

import { useSyncExternalStore } from "react";
import {
  createDebitMemoFromForm,
  getDebitMemoStatistics,
  updateDebitMemoFromForm,
} from "@/app/src/data/modules/general-journal/debit-memo/DebitMemoData";
import type {
  DebitMemoFormValues,
  DebitMemoRecord,
  DebitMemoStatus,
} from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";

type DebitMemoListener = () => void;

const listeners = new Set<DebitMemoListener>();
let records: DebitMemoRecord[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: DebitMemoListener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return records;
}

function getServerSnapshot() {
  return records;
}

export function useDebitMemoStore() {
  const currentRecords = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    records: currentRecords,
    statistics: getDebitMemoStatistics(currentRecords),
    addRecord: async (values: DebitMemoFormValues) => {
      const record = createDebitMemoFromForm(values);

      records = [record, ...records];
      emit();

      return record;
    },
    updateRecord: async (record: DebitMemoRecord) => {
      records = records.map((currentRecord) =>
        currentRecord.id === record.id ? record : currentRecord,
      );
      emit();

      return record;
    },
    updateStatus: async (recordId: string, status: DebitMemoStatus) => {
      const record = records.find((currentRecord) => currentRecord.id === recordId);

      if (!record) {
        throw new Error("Debit Memo not found.");
      }

      const updatedRecord = {
        ...record,
        status,
        updatedAt: new Date().toISOString(),
      };

      records = records.map((currentRecord) =>
        currentRecord.id === recordId ? updatedRecord : currentRecord,
      );
      emit();

      return updatedRecord;
    },
    findRecord: (recordId?: string) =>
      currentRecords.find((record) => record.id === recordId),
  };
}

export function saveDebitMemoRecord(
  record: DebitMemoRecord,
  values: DebitMemoFormValues,
) {
  return updateDebitMemoFromForm(record, values);
}
