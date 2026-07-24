"use client";

import { useMemo, useState } from "react";
import {
  createStorageLayoutRecords,
  StorageLayoutWarehouses,
} from "@/app/src/data/modules/warehouse-management/warehouse-storage/storage-layout/StorageLayoutData";
import type {
  StorageLayoutDraft,
  StorageLayoutRecord,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/storage-layout/StorageLayoutTypes";

export function useStorageLayoutPage() {
  const [records, setRecords] = useState(createStorageLayoutRecords);
  const [warehouseId, setWarehouseId] = useState(StorageLayoutWarehouses[0]?.id ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedLayout, setCopiedLayout] = useState<StorageLayoutRecord[]>([]);
  const visibleRecords = useMemo(
    () =>
      records
        .filter((record) => record.warehouseId === warehouseId)
        .sort((first, second) => first.sequence - second.sequence),
    [records, warehouseId],
  );
  const selectedRecord = records.find((record) => record.id === selectedId) ?? null;

  function saveRecord(draft: StorageLayoutDraft, recordId?: string) {
    if (recordId) {
      setRecords((current) =>
        current.map((record) => (record.id === recordId ? { ...draft, id: recordId } : record)),
      );
      setSelectedId(recordId);
      return;
    }
    const id = `layout-${Date.now()}`;
    setRecords((current) => [...current, { ...draft, id }]);
    setSelectedId(id);
  }

  function duplicateSelected() {
    if (!selectedRecord) return false;
    saveRecord({
      ...selectedRecord,
      code: `${selectedRecord.code}-COPY`,
      name: `${selectedRecord.name} Copy`,
      sequence: visibleRecords.length + 1,
    });
    return true;
  }

  function copyLayout() {
    setCopiedLayout(visibleRecords.map((record) => ({ ...record })));
    return visibleRecords.length;
  }

  function applyLayout() {
    if (!copiedLayout.length) return 0;
    const stamp = Date.now();
    setRecords((current) => [
      ...current,
      ...copiedLayout.map((record, index) => ({
        ...record,
        code: `${record.code}-${index + 1}`,
        id: `${stamp}-${index}`,
        warehouseId,
      })),
    ]);
    return copiedLayout.length;
  }

  function removeSelected() {
    if (!selectedRecord) return;
    setRecords((current) => current.filter((record) => record.id !== selectedRecord.id));
    setSelectedId(null);
  }

  return {
    applyLayout,
    copiedLayout,
    copyLayout,
    duplicateSelected,
    removeSelected,
    saveRecord,
    selectedRecord,
    setSelectedId,
    setWarehouseId,
    visibleRecords,
    warehouseId,
    warehouses: StorageLayoutWarehouses,
  };
}
