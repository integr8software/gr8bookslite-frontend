import { useCallback, useMemo, useState } from "react";
import {
  createBlankCashSalesInvoiceAccountingEntry,
  formatCashSalesInvoiceCurrency,
} from "@/app/src/data/modules/sales/cash-sales-invoice/CashSalesInvoiceData";
import type {
  CashSalesInvoiceAccountingEntry,
  CashSalesInvoiceEntryTab,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
import type { PurchasingAccountingColumnId } from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  createPurchasingAccountingEntryColumns,
  PurchasingAccountingDefaultVisibleColumnIds,
  PurchasingAccountingProtectedColumnIds,
} from "@/app/src/ui/modules/purchasing/shared/PurchasingAccountingEntryColumns";
import { CashSalesInvoiceEntryTabs } from "@/app/src/ui/modules/sales/cash-sales-invoice/entries/CashSalesInvoiceEntryTabs";

type CashSalesInvoiceAccountingEntrySectionProps = {
  activeTab: CashSalesInvoiceEntryTab;
  isReadonly: boolean;
  rows: CashSalesInvoiceAccountingEntry[];
  onRowsChange: (rows: CashSalesInvoiceAccountingEntry[]) => void;
  onTabChange: (tab: CashSalesInvoiceEntryTab) => void;
};

export function CashSalesInvoiceAccountingEntrySection({
  activeTab,
  isReadonly,
  onRowsChange,
  onTabChange,
  rows,
}: CashSalesInvoiceAccountingEntrySectionProps) {
  const accountingRows = useMemo(
    () => (rows.length > 0 ? rows : [createBlankCashSalesInvoiceAccountingEntry()]),
    [rows],
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState<
    PurchasingAccountingColumnId[]
  >([...PurchasingAccountingDefaultVisibleColumnIds]);
  const updateAccountingEntry = useCallback(
    (
      rowId: string,
      updates: Partial<Omit<CashSalesInvoiceAccountingEntry, "id">>,
    ) => {
      onRowsChange(
        accountingRows.map((row) =>
          row.id === rowId ? { ...row, ...updates } : row,
        ),
      );
    },
    [accountingRows, onRowsChange],
  );
  const columns = useMemo(
    () => createPurchasingAccountingEntryColumns(isReadonly, updateAccountingEntry),
    [isReadonly, updateAccountingEntry],
  );
  const visibleColumns = useMemo(
    () =>
      columns.filter((column) =>
        visibleColumnIds.includes(column.id as PurchasingAccountingColumnId),
      ),
    [columns, visibleColumnIds],
  );

  return (
    <ModuleDataEntry
      columns={visibleColumns}
      columnOptions={createColumnOptions(columns, visibleColumnIds)}
      description=""
      emptyRowLabel="accounting entry"
      exportOptions={EntryExportOptions}
      isDraggable
      isReadonly={isReadonly}
      rows={accountingRows}
      summaryCells={createSummaryCells(accountingRows)}
      title={
        <CashSalesInvoiceEntryTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      }
      onAddRows={(count) =>
        onRowsChange([
          ...accountingRows,
          ...Array.from({ length: count }, () =>
            createBlankCashSalesInvoiceAccountingEntry(),
          ),
        ])
      }
      onAutoColumnWidth={() => undefined}
      onClearRows={(action) => onRowsChange(clearRows(accountingRows, action))}
      onDuplicateRow={(rowId) => onRowsChange(duplicateRow(accountingRows, rowId))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) =>
        onRowsChange(insertRow(accountingRows, rowId, position))
      }
      onMoveRow={(fromRowId, toRowId) =>
        onRowsChange(moveRow(accountingRows, fromRowId, toRowId))
      }
      onRemoveRow={(rowId) => onRowsChange(removeRow(accountingRows, rowId))}
      onToggleColumnVisibility={(columnId, isVisible) =>
        setVisibleColumnIds((current) =>
          toggleColumnVisibility(
            current,
            columnId as PurchasingAccountingColumnId,
            isVisible,
          ),
        )
      }
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function createColumnOptions(
  columns: ModuleDataEntryColumn<CashSalesInvoiceAccountingEntry>[],
  visibleColumnIds: PurchasingAccountingColumnId[],
): ModuleDataEntryColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    isHideable: !PurchasingAccountingProtectedColumnIds.has(
      column.id as PurchasingAccountingColumnId,
    ),
    isVisible: visibleColumnIds.includes(column.id as PurchasingAccountingColumnId),
    label: column.header,
    width: column.width,
    widthMode: column.widthMode,
  }));
}

function toggleColumnVisibility(
  current: PurchasingAccountingColumnId[],
  columnId: PurchasingAccountingColumnId,
  isVisible: boolean,
) {
  if (PurchasingAccountingProtectedColumnIds.has(columnId)) {
    return current;
  }

  if (isVisible) {
    return current.includes(columnId) ? current : [...current, columnId];
  }

  return current.filter((currentColumnId) => currentColumnId !== columnId);
}

function createSummaryCells(rows: CashSalesInvoiceAccountingEntry[]) {
  const totals = rows.reduce(
    (summary, row) => ({
      credit: summary.credit + row.credit,
      debit: summary.debit + row.debit,
    }),
    { credit: 0, debit: 0 },
  );

  return {
    accountTitle: "Totals",
    credit: formatCashSalesInvoiceCurrency(totals.credit),
    debit: formatCashSalesInvoiceCurrency(totals.debit),
  };
}

function clearRows(
  rows: CashSalesInvoiceAccountingEntry[],
  action: ModuleDataEntryClearAction,
) {
  if (action === "all") {
    return [createBlankCashSalesInvoiceAccountingEntry()];
  }

  const nextRows = rows.filter((row) => !shouldClearRow(row, action));
  return nextRows.length > 0 ? nextRows : [createBlankCashSalesInvoiceAccountingEntry()];
}

function shouldClearRow(
  row: CashSalesInvoiceAccountingEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  const hasData = accountingEntryHasData(row);

  if (action === "with-data") {
    return hasData;
  }

  if (action === "incomplete") {
    return hasData && !row.accountTitle.trim();
  }

  return !hasData;
}

function accountingEntryHasData(row: CashSalesInvoiceAccountingEntry) {
  return (
    row.accountCode.trim() !== "" ||
    row.accountTitle.trim() !== "" ||
    row.debit > 0 ||
    row.credit > 0 ||
    row.partyCode.trim() !== "" ||
    row.partyName.trim() !== "" ||
    row.particulars.trim() !== "" ||
    row.vatType.trim() !== "" ||
    row.atcCode.trim() !== "" ||
    row.responsibilityCenter.trim() !== "" ||
    row.refNo.trim() !== ""
  );
}

function duplicateRow(rows: CashSalesInvoiceAccountingEntry[], rowId: string) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const row = rows[rowIndex];
  if (!row) return rows;
  const nextRows = [...rows];
  nextRows.splice(rowIndex + 1, 0, {
    ...row,
    id: createBlankCashSalesInvoiceAccountingEntry().id,
  });
  return nextRows;
}

function insertRow(
  rows: CashSalesInvoiceAccountingEntry[],
  rowId: string,
  position: "above" | "below",
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const insertIndex = rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
  const nextRows = [...rows];
  nextRows.splice(insertIndex, 0, createBlankCashSalesInvoiceAccountingEntry());
  return nextRows;
}

function moveRow(
  rows: CashSalesInvoiceAccountingEntry[],
  fromRowId: string,
  toRowId: string,
) {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return rows;
  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);
  if (!movedRow) return rows;
  nextRows.splice(toIndex, 0, movedRow);
  return nextRows;
}

function removeRow(rows: CashSalesInvoiceAccountingEntry[], rowId: string) {
  const nextRows = rows.filter((row) => row.id !== rowId);
  return nextRows.length > 0 ? nextRows : [createBlankCashSalesInvoiceAccountingEntry()];
}

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
