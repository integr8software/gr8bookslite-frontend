"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type {
  AccountingEntry,
  AccountingEntryColumnId,
  AccountingEntryUpdate,
} from "@/app/src/types/shared/accounting/AccountingEntryTypes";
import {
  AccountingEntryDefaultVisibleColumnIds,
  AccountingEntryProtectedColumnIds,
  createAccountingEntryColumns,
  type AccountingEntryColumnConfig,
  type AccountingEntryColumnOptions,
} from "@/app/src/ui/shared/accounting-entry/AccountingEntryColumns";
import {
  clearAccountingEntryRows,
  createAccountingEntryRows,
  duplicateAccountingEntryRow,
  insertAccountingEntryRow,
  moveAccountingEntryRow,
  removeAccountingEntryRow,
  type AccountingEntryRowFactory,
} from "@/app/src/ui/shared/accounting-entry/AccountingEntryRowUtils";
import { getAccountingEntryTotals } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTotals";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

import type { ModuleDataEntryColumn } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

type AccountingEntryTableProps<TRow extends AccountingEntry> = {
  createBlankRow: AccountingEntryRowFactory<TRow>;
  columnIds?: readonly AccountingEntryColumnId[];
  columnLabels?: Partial<Record<AccountingEntryColumnId, string>>;
  customColumns?: ModuleDataEntryColumn<TRow>[];
  description?: string;
  emptyRowLabel?: string;
  error?: string;
  fieldOptions?: AccountingEntryColumnOptions;
  highlightedAmountRowIds?: ReadonlySet<string>;
  onFieldChange?: AccountingEntryColumnConfig<TRow>["onFieldChange"];
  isReadonly: boolean;
  readOnlyFields?: readonly AccountingEntryColumnId[];
  rows: TRow[];
  title?: ReactNode;
  visibleColumnIds?: readonly AccountingEntryColumnId[];
  onRowsChange: (rows: TRow[]) => void;
};

export function AccountingEntryTable<TRow extends AccountingEntry>({
  createBlankRow,
  columnIds,
  columnLabels,
  customColumns,
  description = "Record accounting distributions.",
  emptyRowLabel = "accounting entry",
  error,
  fieldOptions,
  highlightedAmountRowIds,
  isReadonly,
  onFieldChange,
  readOnlyFields = [],
  onRowsChange,
  rows,
  title = "Accounting Entries",
  visibleColumnIds = AccountingEntryDefaultVisibleColumnIds,
}: AccountingEntryTableProps<TRow>) {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => new Set(visibleColumnIds));
  const updateEntry = useCallback<AccountingEntryUpdate<TRow>>(
    (rowId, updates) => {
      onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)));
    },
    [onRowsChange, rows],
  );
  const columns = useMemo(
    () =>
      createAccountingEntryColumns<TRow>({
        columnIds,
        columnLabels,
        customColumns,
        isReadonly,
        onUpdateEntry: updateEntry,
        onFieldChange,
        highlightedAmountRowIds,
        options: fieldOptions,
        readOnlyFields,
      }),
    [
      columnIds,
      columnLabels,
      customColumns,
      highlightedAmountRowIds,
      isReadonly,
      fieldOptions,
      onFieldChange,
      readOnlyFields,
      updateEntry,
    ],
  );
  const displayedColumns = useMemo(
    () => columns.filter((column) => visibleColumns.has(column.id)),
    [columns, visibleColumns],
  );
  const totals = getAccountingEntryTotals(rows);
  const columnOptions = columns.map((column) => ({
    id: column.id,
    isHideable: !AccountingEntryProtectedColumnIds.has(column.id as AccountingEntryColumnId),
    isVisible: visibleColumns.has(column.id),
    label: column.header,
    width: column.width,
    widthMode: column.widthMode,
  }));

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    setVisibleColumns((current) => {
      if (!isVisible && AccountingEntryProtectedColumnIds.has(columnId as AccountingEntryColumnId)) {
        return current;
      }
      const next = new Set(current);
      if (isVisible) {
        next.add(columnId);
      } else {
        next.delete(columnId);
      }
      return next;
    });
  }

  return (
    <ModuleDataEntry
      columns={displayedColumns}
      columnOptions={columnOptions}
      description={description}
      emptyRowLabel={emptyRowLabel}
      error={error}
      exportOptions={AccountingEntryExportOptions}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{
        debit: totals.debit.toFixed(2),
        credit: totals.credit.toFixed(2),
        particulars: totals.isBalanced ? "Balanced" : `Difference: ${totals.difference.toFixed(2)}`,
      }}
      title={title}
      onAddRows={(count) => onRowsChange([...rows, ...createAccountingEntryRows(count, createBlankRow)])}
      onAutoColumnWidth={() => undefined}
      onClearRows={(action: ModuleDataEntryClearAction) => onRowsChange(clearAccountingEntryRows(rows, action, createBlankRow))}
      onDuplicateRow={(rowId) => onRowsChange(duplicateAccountingEntryRow(rows, rowId, createBlankRow))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) => onRowsChange(insertAccountingEntryRow(rows, rowId, position, createBlankRow))}
      onMoveRow={(fromRowId, toRowId) => onRowsChange(moveAccountingEntryRow(rows, fromRowId, toRowId))}
      onRemoveRow={(rowId) => onRowsChange(removeAccountingEntryRow(rows, rowId, createBlankRow))}
      onToggleColumnVisibility={toggleColumnVisibility}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

const AccountingEntryExportOptions: ModuleDataEntryExportOption[] = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
];
