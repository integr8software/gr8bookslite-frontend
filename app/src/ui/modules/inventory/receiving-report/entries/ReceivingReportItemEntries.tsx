"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Gift } from "lucide-react";
import {
  createReceivingReportLine,
  type ReceivingReportLine,
  type ReceivingReportTotals,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import {
  DefaultHiddenReceivingReportItemColumns,
  ReceivingReportItemColumnConfigs,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ErrorText } from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportFields";
import { ReceivingReportEntryCell } from "@/app/src/ui/modules/inventory/receiving-report/entries/ReceivingReportEntryCells";
import {
  formatReceivingReportEntryAmount,
  shouldClearReceivingReportEntry,
} from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportUtils";
import type {
  ReceivingReportColumnConfig,
  ReceivingReportEntryUpdater,
  ReceivingReportLineField,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function ReceivingReportItemEntries({
  error,
  isReadonly,
  onRowsChange,
  onUpdateLine,
  rows,
  title,
  totals,
}: {
  error?: string;
  isReadonly: boolean;
  onRowsChange: (rows: ReceivingReportLine[]) => void;
  onUpdateLine: ReceivingReportEntryUpdater;
  rows: ReceivingReportLine[];
  title: ReactNode;
  totals: ReceivingReportTotals;
}) {
  const updateEntry = useCallback(
    (rowId: string, field: ReceivingReportLineField, value: string) => {
      onUpdateLine(rowId, field, value);
    },
    [onUpdateLine],
  );
  const columns = useMemo<ModuleDataEntryColumn<ReceivingReportLine>[]>(
    () => createReceivingReportColumns(ReceivingReportItemColumnConfigs, isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(
    () =>
      new Set(
        columns
          .map((column) => column.id)
          .filter((columnId) => !DefaultHiddenReceivingReportItemColumns.has(columnId)),
      ),
  );
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIds.has(column.id)),
    [columns, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: DefaultHiddenReceivingReportItemColumns.has(column.id),
        isVisible: visibleColumnIds.has(column.id),
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns, visibleColumnIds],
  );

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    setVisibleColumnIds((current) => {
      if (!isVisible && !DefaultHiddenReceivingReportItemColumns.has(columnId)) {
        return current;
      }

      const next = new Set(current);
      isVisible ? next.add(columnId) : next.delete(columnId);
      return next;
    });
  }

  function addRows(count: number) {
    onRowsChange([...rows, ...Array.from({ length: count }, () => createReceivingReportLine())]);
  }

  function addFreebies() {
    onRowsChange([
      ...rows,
      createReceivingReportLine({
        description: "Freebie item",
        itemCategory: "Freebies",
        cost: "0.00",
        grossAmount: "0.0000",
        netAmount: "0.0000",
        rrQty: "1.00",
      }),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createReceivingReportLine()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearReceivingReportEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportLine()]);
  }

  function duplicateRow(rowId: string) {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];

    if (!row) return;

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, { ...row, id: createReceivingReportLine().id });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) return;

    const nextRows = [...rows];
    nextRows.splice(position === "above" ? rowIndex : rowIndex + 1, 0, createReceivingReportLine());
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportLine()]);
  }

  return (
    <div className="grid gap-5">
      {error ? <ErrorText message={error} /> : null}
      <ModuleDataEntry
        addMenuActions={[
          {
            disabled: isReadonly,
            icon: Gift,
            id: "add-freebies",
            label: "Add Freebies",
            onSelect: addFreebies,
          },
        ]}
        columns={visibleColumns}
        columnOptions={columnOptions}
        description="Record received items, quantities, costs, VAT, and warehouse details."
        emptyRowLabel="received item"
        exportOptions={[
          { id: "csv", label: "CSV", onSelect: () => undefined },
          { id: "excel", label: "Excel", onSelect: () => undefined },
          { id: "pdf", label: "PDF", onSelect: () => undefined },
        ]}
        isDraggable
        isReadonly={isReadonly}
        rows={rows}
        summaryCells={{
          discountAmount: formatReceivingReportEntryAmount(totals.discountAmount),
          ewtAmount: formatReceivingReportEntryAmount(totals.ewtAmount),
          grossAmount: formatReceivingReportEntryAmount(totals.grossAmount),
          netAmount: formatReceivingReportEntryAmount(totals.netAmount),
          vatAmount: formatReceivingReportEntryAmount(totals.vatAmount),
        }}
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
    </div>
  );
}

function createReceivingReportColumns(
  columnConfigs: ReceivingReportColumnConfig[],
  isReadonly: boolean,
  onUpdateEntry: ReceivingReportEntryUpdater,
): ModuleDataEntryColumn<ReceivingReportLine>[] {
  return columnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row) => (
      <ReceivingReportEntryCell
        column={column}
        isReadonly={isReadonly}
        row={row}
        onUpdateEntry={onUpdateEntry}
      />
    ),
  }));
}
