import { useCallback, useMemo, useState } from "react";
import {
  createBillingStatementId,
  createBlankBillingStatementAccountingEntry,
  createBlankBillingStatementItem,
  formatBillingStatementCurrency,
} from "@/app/src/data/modules/sales/billing-statement/BillingStatementData";
import type {
  BillingStatementAccountingEntry,
  BillingStatementItem,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import type {
  PurchasingAccountingColumnId,
  PurchasingEntryTab,
} from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  createPurchasingAccountingEntryColumns,
  PurchasingAccountingDefaultVisibleColumnIds,
  PurchasingAccountingProtectedColumnIds,
} from "@/app/src/ui/modules/purchasing/shared/PurchasingAccountingEntryColumns";
import { PurchasingEntryTabs } from "@/app/src/ui/modules/purchasing/shared/PurchasingEntryTabs";
import { createBillingStatementLineColumns } from "@/app/src/ui/modules/sales/billing-statement/entries/BillingStatementLineColumns";

type BillingStatementEntrySectionProps = {
  accountingRows: BillingStatementAccountingEntry[];
  error?: string;
  isReadonly: boolean;
  rows: BillingStatementItem[];
  onAccountingRowsChange: (rows: BillingStatementAccountingEntry[]) => void;
  onRowsChange: (rows: BillingStatementItem[]) => void;
};

export function BillingStatementEntrySection({
  accountingRows,
  error,
  isReadonly,
  onAccountingRowsChange,
  onRowsChange,
  rows,
}: BillingStatementEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<PurchasingEntryTab>("details");
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
    PurchasingAccountingColumnId[]
  >([...PurchasingAccountingDefaultVisibleColumnIds]);

  const updateEntry = useCallback(
    (rowId: string, updates: Partial<BillingStatementItem>) => {
      onRowsChange(rows.map((row) => (row.id === rowId ? normalizeEntry({ ...row, ...updates }) : row)));
    },
    [onRowsChange, rows],
  );

  const updateAccountingEntry = useCallback(
    (rowId: string, updates: Partial<Omit<BillingStatementAccountingEntry, "id">>) => {
      onAccountingRowsChange(
        accountingRows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
      );
    },
    [accountingRows, onAccountingRowsChange],
  );

  const columns = useMemo(
    () => createBillingStatementLineColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const accountingColumns = useMemo(
    () => createPurchasingAccountingEntryColumns(isReadonly, updateAccountingEntry),
    [isReadonly, updateAccountingEntry],
  );
  const visibleAccountingColumns = useMemo(
    () =>
      accountingColumns.filter((column) =>
        visibleAccountingColumnIds.includes(column.id as PurchasingAccountingColumnId),
      ),
    [accountingColumns, visibleAccountingColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !["description", "amount", "quantity"].includes(column.id),
        isVisible: true,
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns],
  );

  if (activeTab === "accounting") {
    return (
      <ModuleDataEntry
        columns={visibleAccountingColumns}
        columnOptions={createAccountingColumnOptions(accountingColumns, visibleAccountingColumnIds)}
        description=""
        emptyRowLabel="accounting entry"
        error={error}
        exportOptions={EntryExportOptions}
        isDraggable
        isReadonly={isReadonly}
        rows={accountingRows}
        summaryCells={createAccountingSummaryCells(accountingRows)}
        title={
          <PurchasingEntryTabs
            activeTab={activeTab}
            detailsLabel="Items"
            onTabChange={setActiveTab}
          />
        }
        onAddRows={(count) =>
          onAccountingRowsChange([
            ...accountingRows,
            ...Array.from({ length: count }, () => createBlankBillingStatementAccountingEntry()),
          ])
        }
        onAutoColumnWidth={() => undefined}
        onClearRows={(action) =>
          onAccountingRowsChange(clearRows(accountingRows, action, createBlankBillingStatementAccountingEntry))
        }
        onDuplicateRow={(rowId) =>
          onAccountingRowsChange(duplicateRow(accountingRows, rowId, () => createBillingStatementId("accounting")))
        }
        onFitColumnWidth={() => undefined}
        onImport={() => undefined}
        onInsertRow={(rowId, position) =>
          onAccountingRowsChange(insertRow(accountingRows, rowId, position, createBlankBillingStatementAccountingEntry))
        }
        onMoveRow={(fromRowId, toRowId) =>
          onAccountingRowsChange(moveRow(accountingRows, fromRowId, toRowId))
        }
        onRemoveRow={(rowId) =>
          onAccountingRowsChange(removeRow(accountingRows, rowId, createBlankBillingStatementAccountingEntry))
        }
        onToggleColumnVisibility={(columnId, isVisible) =>
          setVisibleAccountingColumnIds((current) =>
            toggleAccountingColumnVisibility(current, columnId as PurchasingAccountingColumnId, isVisible),
          )
        }
        onUpdateColumnHeader={() => undefined}
        onUpdateColumnWidth={() => undefined}
      />
    );
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="billing line"
      error={error}
      exportOptions={EntryExportOptions}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={createItemSummaryCells(rows)}
      title={
        <PurchasingEntryTabs
          activeTab={activeTab}
          detailsLabel="Items"
          onTabChange={setActiveTab}
        />
      }
      onAddRows={(count) =>
        onRowsChange([...rows, ...Array.from({ length: count }, () => createBlankBillingStatementItem())])
      }
      onAutoColumnWidth={() => undefined}
      onClearRows={(action) => onRowsChange(clearRows(rows, action, createBlankBillingStatementItem))}
      onDuplicateRow={(rowId) =>
        onRowsChange(duplicateRow(rows, rowId, () => createBillingStatementId("item")))
      }
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) =>
        onRowsChange(insertRow(rows, rowId, position, createBlankBillingStatementItem))
      }
      onMoveRow={(fromRowId, toRowId) => onRowsChange(moveRow(rows, fromRowId, toRowId))}
      onRemoveRow={(rowId) => onRowsChange(removeRow(rows, rowId, createBlankBillingStatementItem))}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function createAccountingColumnOptions(
  columns: { id: string; header: string; width?: number; widthMode?: "auto" | "fixed" }[],
  visibleColumnIds: PurchasingAccountingColumnId[],
) {
  return columns.map((column) => ({
    id: column.id,
    isHideable: !PurchasingAccountingProtectedColumnIds.has(column.id as PurchasingAccountingColumnId),
    isVisible: visibleColumnIds.includes(column.id as PurchasingAccountingColumnId),
    label: column.header,
    width: column.width,
    widthMode: column.widthMode,
  }));
}

function toggleAccountingColumnVisibility(
  current: PurchasingAccountingColumnId[],
  columnId: PurchasingAccountingColumnId,
  isVisible: boolean,
) {
  if (PurchasingAccountingProtectedColumnIds.has(columnId)) return current;
  if (isVisible) return current.includes(columnId) ? current : [...current, columnId];
  return current.filter((currentColumnId) => currentColumnId !== columnId);
}

function createAccountingSummaryCells(rows: BillingStatementAccountingEntry[]) {
  const totals = rows.reduce(
    (summary, entry) => ({
      credit: summary.credit + entry.credit,
      debit: summary.debit + entry.debit,
    }),
    { credit: 0, debit: 0 },
  );

  return {
    accountTitle: "Totals",
    credit: formatBillingStatementCurrency(totals.credit),
    debit: formatBillingStatementCurrency(totals.debit),
  };
}

function createItemSummaryCells(rows: BillingStatementItem[]) {
  const totals = rows.reduce(
    (summary, row) => ({
      grossAmount: summary.grossAmount + row.grossAmount,
      netAmount: summary.netAmount + row.netAmount,
      vatAmount: summary.vatAmount + row.vatAmount,
    }),
    { grossAmount: 0, netAmount: 0, vatAmount: 0 },
  );

  return {
    description: "Totals",
    grossAmount: formatBillingStatementCurrency(totals.grossAmount),
    netAmount: formatBillingStatementCurrency(totals.netAmount),
    vatAmount: formatBillingStatementCurrency(totals.vatAmount),
  };
}

function clearRows<TRow extends { id: string }>(
  rows: TRow[],
  action: ModuleDataEntryClearAction,
  createFallbackRow: () => TRow,
) {
  if (action === "all") return [createFallbackRow()];
  const nextRows = rows.filter((row) => {
    const hasData = rowHasData(row);
    if (action === "with-data") return !hasData;
    if (action === "no-data") return hasData;
    return true;
  });
  return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

function duplicateRow<TRow extends { id: string }>(rows: TRow[], rowId: string, createId: () => string) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const row = rows[rowIndex];
  if (!row) return rows;
  const nextRows = [...rows];
  nextRows.splice(rowIndex + 1, 0, { ...row, id: createId() });
  return nextRows;
}

function insertRow<TRow extends { id: string }>(
  rows: TRow[],
  rowId: string,
  position: "above" | "below",
  createRow: () => TRow,
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const insertIndex = rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
  const nextRows = [...rows];
  nextRows.splice(insertIndex, 0, createRow());
  return nextRows;
}

function moveRow<TRow extends { id: string }>(rows: TRow[], fromRowId: string, toRowId: string) {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return rows;
  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);
  if (!movedRow) return rows;
  nextRows.splice(toIndex, 0, movedRow);
  return nextRows;
}

function removeRow<TRow extends { id: string }>(rows: TRow[], rowId: string, createFallbackRow: () => TRow) {
  const nextRows = rows.filter((row) => row.id !== rowId);
  return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];

function normalizeEntry(entry: BillingStatementItem): BillingStatementItem {
  const amount = Number(entry.amount) || 0;
  const quantity = Number(entry.quantity) || 0;
  const discountAmount = Number(entry.discountAmount) || 0;
  const grossAmount = Number(entry.grossAmount) || amount * quantity;

  return {
    ...entry,
    amount,
    quantity,
    discountAmount,
    ewtAmount: Number(entry.ewtAmount) || 0,
    grossAmount,
    netAmount: Number(entry.netAmount) || Math.max(grossAmount - discountAmount, 0),
    vatAmount: Number(entry.vatAmount) || 0,
    wvatAmount: Number(entry.wvatAmount) || 0,
  };
}

function rowHasData(row: { id: string }) {
  return Object.entries(row).some(([key, value]) => {
    if (key === "id") return false;
    if (typeof value === "number") return value !== 0;
    return Boolean(String(value ?? "").trim());
  });
}
