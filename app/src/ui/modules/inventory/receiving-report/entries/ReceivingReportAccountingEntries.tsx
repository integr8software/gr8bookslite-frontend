"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  createReceivingReportAccountingEntry,
  type ReceivingReportAccountingEntry,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import {
  DefaultVisibleReceivingReportAccountingColumns,
  ReceivingReportAccountingColumnConfigs,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ReceivingReportAccountingEntryCell } from "@/app/src/ui/modules/inventory/receiving-report/entries/ReceivingReportEntryCells";
import { shouldClearAccountingEntry } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportUtils";
import type {
  ReceivingReportAccountingColumnConfig,
  ReceivingReportAccountingEntryField,
  ReceivingReportAccountingEntryUpdater,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function ReceivingReportAccountingEntries({
  isReadonly,
  onRowsChange,
  onUpdateEntry,
  rows,
  title,
}: {
  isReadonly: boolean;
  onRowsChange: (rows: ReceivingReportAccountingEntry[]) => void;
  onUpdateEntry: ReceivingReportAccountingEntryUpdater;
  rows: ReceivingReportAccountingEntry[];
  title: ReactNode;
}) {
  const updateEntry = useCallback(
    (rowId: string, field: ReceivingReportAccountingEntryField, value: string) => {
      onUpdateEntry(rowId, field, value);
    },
    [onUpdateEntry],
  );
  const columns = useMemo<ModuleDataEntryColumn<ReceivingReportAccountingEntry>[]>(
    () => createReceivingReportAccountingColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(
    () => new Set(DefaultVisibleReceivingReportAccountingColumns),
  );
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIds.has(column.id)),
    [columns, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !DefaultVisibleReceivingReportAccountingColumns.has(column.id),
        isVisible: visibleColumnIds.has(column.id),
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns, visibleColumnIds],
  );

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    setVisibleColumnIds((current) => {
      if (!isVisible && DefaultVisibleReceivingReportAccountingColumns.has(columnId)) {
        return current;
      }

      const next = new Set(current);
      isVisible ? next.add(columnId) : next.delete(columnId);
      return next;
    });
  }

  function addRows(count: number) {
    onRowsChange([
      ...rows,
      ...Array.from({ length: count }, () => createReceivingReportAccountingEntry()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createReceivingReportAccountingEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportAccountingEntry()]);
  }

  function duplicateRow(rowId: string) {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];

    if (!row) return;

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, {
      ...row,
      id: createReceivingReportAccountingEntry().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) return;

    const nextRows = [...rows];
    nextRows.splice(
      position === "above" ? rowIndex : rowIndex + 1,
      0,
      createReceivingReportAccountingEntry(),
    );
    onRowsChange(nextRows);
  }

  function moveRow(fromRowId: string, toRowId: string) {
    const fromIndex = rows.findIndex((row) => row.id === fromRowId);
    const toIndex = rows.findIndex((row) => row.id === toRowId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

    const nextRows = [...rows];
    const [movedRow] = nextRows.splice(fromIndex, 1);

    if (!movedRow) return;

    nextRows.splice(toIndex, 0, movedRow);
    onRowsChange(nextRows);
  }

  function removeRow(rowId: string) {
    const nextRows = rows.filter((row) => row.id !== rowId);
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportAccountingEntry()]);
  }

  return (
    <ModuleDataEntry
      columns={visibleColumns}
      columnOptions={columnOptions}
      description="Record receiving report accounting distributions."
      emptyRowLabel="accounting entry"
      exportOptions={[
        { id: "csv", label: "CSV", onSelect: () => undefined },
        { id: "excel", label: "Excel", onSelect: () => undefined },
        { id: "pdf", label: "PDF", onSelect: () => undefined },
      ]}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      title={title}
      onAddRows={addRows}
      onAutoColumnWidth={() => undefined}
      onClearRows={clearRows}
      onDuplicateRow={duplicateRow}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={insertRow}
      onMoveRow={moveRow}
      onRemoveRow={removeRow}
      onToggleColumnVisibility={toggleColumnVisibility}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function createReceivingReportAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: ReceivingReportAccountingEntryUpdater,
): ModuleDataEntryColumn<ReceivingReportAccountingEntry>[] {
  return ReceivingReportAccountingColumnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row) => (
      <ReceivingReportAccountingEntryCell
        column={column}
        isReadonly={isReadonly}
        row={row}
        onUpdateEntry={onUpdateEntry}
      />
    ),
  }));
}
