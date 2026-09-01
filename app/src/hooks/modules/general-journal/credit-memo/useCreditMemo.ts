"use client";

import { useSyncExternalStore } from "react";
import {
  createCreditMemoFromForm,
  getCreditMemoStatistics,
  updateCreditMemoFromForm,
} from "@/app/src/data/modules/general-journal/credit-memo/CreditMemoData";
import type {
  CreditMemoFormValues,
  CreditMemoRecord,
  CreditMemoStatus,
} from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";

type CreditMemoListener = () => void;

const listeners = new Set<CreditMemoListener>();
let records: CreditMemoRecord[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: CreditMemoListener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return records;
}

function getServerSnapshot() {
  return records;
}

export function useCreditMemoStore() {
  const currentRecords = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    records: currentRecords,
    statistics: getCreditMemoStatistics(currentRecords),
    addRecord: async (values: CreditMemoFormValues) => {
      const record = createCreditMemoFromForm(values);

      records = [record, ...records];
      emit();

      return record;
    },
    updateRecord: async (record: CreditMemoRecord) => {
      records = records.map((currentRecord) =>
        currentRecord.id === record.id ? record : currentRecord,
      );
      emit();

      return record;
    },
    updateStatus: async (recordId: string, status: CreditMemoStatus) => {
      const record = records.find((currentRecord) => currentRecord.id === recordId);

      if (!record) {
        throw new Error("Credit memo not found.");
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

export function saveCreditMemoRecord(
  record: CreditMemoRecord,
  values: CreditMemoFormValues,
) {
  return updateCreditMemoFromForm(record, values);
}
