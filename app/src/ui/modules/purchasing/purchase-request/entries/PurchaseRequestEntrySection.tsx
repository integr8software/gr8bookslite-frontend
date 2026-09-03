import { useCallback, useMemo, useState } from "react";
import {
  createBlankPurchaseRequestAccountingEntry,
  createPurchaseRequestId,
  emptyPurchaseRequestItem,
  formatPurchaseRequestCurrency,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type {
  PurchaseRequestAccountingEntry,
  PurchaseRequestItem,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { ItemRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import type { ServiceMaintenanceOptionResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PurchasingAccountingColumnId,
  PurchasingEntryTab,
} from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createPurchaseRequestLineColumns } from "@/app/src/ui/modules/purchasing/purchase-request/entries/PurchaseRequestLineColumns";
import {
  createPurchasingAccountingEntryColumns,
  PurchasingAccountingDefaultVisibleColumnIds,
  PurchasingAccountingProtectedColumnIds,
} from "@/app/src/ui/modules/purchasing/shared/PurchasingAccountingEntryColumns";

type PurchaseRequestEntrySectionProps = {
  accountingRows: PurchaseRequestAccountingEntry[];
  error?: string;
  itemDescriptionOptions: ItemRecord[];
  isReadonly: boolean;
  purchaseType?: string;
  rows: PurchaseRequestItem[];
  serviceDescriptionOptions: ServiceMaintenanceOptionResponseDto[];
  onAccountingRowsChange: (rows: PurchaseRequestAccountingEntry[]) => void;
  onRowsChange: (rows: PurchaseRequestItem[]) => void;
};

export function PurchaseRequestEntrySection({
  accountingRows,
  error,
  itemDescriptionOptions,
  isReadonly,
  purchaseType,
  serviceDescriptionOptions,
  onAccountingRowsChange,
  onRowsChange,
  rows,
}: PurchaseRequestEntrySectionProps) {
  const [activeTab] = useState<PurchasingEntryTab>("details");
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
    PurchasingAccountingColumnId[]
  >([...PurchasingAccountingDefaultVisibleColumnIds]);
  const isServices = purchaseType?.toLowerCase() === "services";
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<PurchaseRequestItem>) => {
      onRowsChange(
        rows.map((row) => (row.id === rowId ? normalizeEntry({ ...row, ...updates }) : row)),
      );
    },
    [onRowsChange, rows],
  );
  const updateAccountingEntry = useCallback(
    (
      rowId: string,
      updates: Partial<Omit<PurchaseRequestAccountingEntry, "id">>,
    ) => {
      onAccountingRowsChange(
        accountingRows.map((row) =>
          row.id === rowId ? { ...row, ...updates } : row,
        ),
      );
    },
    [accountingRows, onAccountingRowsChange],
  );
  const columns = useMemo<ModuleDataEntryColumn<PurchaseRequestItem>[]>(
    () =>
      createPurchaseRequestLineColumns(
        isReadonly,
        updateEntry,
        purchaseType,
        serviceDescriptionOptions,
        itemDescriptionOptions,
      ),
    [isReadonly, itemDescriptionOptions, purchaseType, serviceDescriptionOptions, updateEntry],
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
        isHideable: !["itemCode", "description", "quantity"].includes(column.id),
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
        columnOptions={createAccountingColumnOptions(
          accountingColumns,
          visibleAccountingColumnIds,
        )}
        description=""
        emptyRowLabel="accounting entry"
        error={error}
        exportOptions={EntryExportOptions}
        isDraggable
        isReadonly={isReadonly}
        rows={accountingRows}
        summaryCells={createAccountingSummaryCells(accountingRows)}
        title="Accounting Entries"
        onAddRows={(count) =>
          onAccountingRowsChange([
            ...accountingRows,
            ...Array.from({ length: count }, () =>
              createBlankPurchaseRequestAccountingEntry(),
            ),
          ])
        }
        onAutoColumnWidth={() => undefined}
        onClearRows={(action) =>
          onAccountingRowsChange(
            clearAccountingRows(
              accountingRows,
              action,
              createBlankPurchaseRequestAccountingEntry,
            ),
          )
        }
        onDuplicateRow={(rowId) =>
          onAccountingRowsChange(
            duplicateEntryRow(accountingRows, rowId, () =>
              createBlankPurchaseRequestAccountingEntry().id,
            ),
          )
        }
        onFitColumnWidth={() => undefined}
        onImport={() => undefined}
        onInsertRow={(rowId, position) =>
          onAccountingRowsChange(
            insertEntryRow(
              accountingRows,
              rowId,
              position,
              createBlankPurchaseRequestAccountingEntry,
            ),
          )
        }
        onMoveRow={(fromRowId, toRowId) =>
          onAccountingRowsChange(moveEntryRow(accountingRows, fromRowId, toRowId))
        }
        onRemoveRow={(rowId) =>
          onAccountingRowsChange(
            removeEntryRow(
              accountingRows,
              rowId,
              createBlankPurchaseRequestAccountingEntry,
            ),
          )
        }
        onToggleColumnVisibility={(columnId, isVisible) =>
          setVisibleAccountingColumnIds((current) =>
            toggleAccountingColumnVisibility(
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

  function addRows(count: number) {
    onRowsChange([
      ...rows,
      ...Array.from({ length: count }, () => createBlankPurchaseRequestItem()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankPurchaseRequestItem()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearEntry(row, action, isServices));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankPurchaseRequestItem()]);
  }

  function duplicateRow(rowId: string) {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];

    if (!row) return;

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, {
      ...row,
      id: createPurchaseRequestId("item"),
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
      createBlankPurchaseRequestItem(),
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankPurchaseRequestItem()]);
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="purchase request line"
      error={error}
      exportOptions={[
        ...EntryExportOptions,
      ]}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      title="Purchase Request Details"
      onAddRows={addRows}
      onAutoColumnWidth={() => undefined}
      onClearRows={clearRows}
      onDuplicateRow={duplicateRow}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={insertRow}
      onMoveRow={moveRow}
      onRemoveRow={removeRow}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function createAccountingColumnOptions(
  columns: ModuleDataEntryColumn<PurchaseRequestAccountingEntry>[],
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

function toggleAccountingColumnVisibility(
  current: PurchasingAccountingColumnId[],
  columnId: PurchasingAccountingColumnId,
  isVisible: boolean,
) {
  if (PurchasingAccountingProtectedColumnIds.has(columnId)) return current;
  if (isVisible) return current.includes(columnId) ? current : [...current, columnId];
  return current.filter((currentColumnId) => currentColumnId !== columnId);
}

function createAccountingSummaryCells(rows: PurchaseRequestAccountingEntry[]) {
  const totals = rows.reduce(
    (summary, entry) => ({
      credit: summary.credit + entry.credit,
      debit: summary.debit + entry.debit,
    }),
    { credit: 0, debit: 0 },
  );

  return {
    accountTitle: "Totals",
    credit: formatPurchaseRequestCurrency(totals.credit),
    debit: formatPurchaseRequestCurrency(totals.debit),
  };
}

function clearAccountingRows(
  rows: PurchaseRequestAccountingEntry[],
  action: ModuleDataEntryClearAction,
  createFallbackRow: () => PurchaseRequestAccountingEntry,
) {
  if (action === "all") return [createFallbackRow()];
  const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));
  return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

function shouldClearAccountingEntry(
  entry: PurchaseRequestAccountingEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  const hasData =
    entry.accountCode.trim() !== "" ||
    entry.accountTitle.trim() !== "" ||
    entry.partyCode.trim() !== "" ||
    entry.partyName.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    entry.vatType.trim() !== "" ||
    entry.atcCode.trim() !== "" ||
    entry.responsibilityCenter.trim() !== "" ||
    entry.refNo.trim() !== "" ||
    entry.debit > 0 ||
    entry.credit > 0;

  if (action === "with-data") return hasData;
  if (action === "incomplete") return hasData && !entry.accountTitle.trim();
  return !hasData;
}

function duplicateEntryRow<TRow extends { id: string }>(
  rows: TRow[],
  rowId: string,
  createId: () => string,
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const row = rows[rowIndex];
  if (!row) return rows;
  const nextRows = [...rows];
  nextRows.splice(rowIndex + 1, 0, { ...row, id: createId() });
  return nextRows;
}

function insertEntryRow<TRow extends { id: string }>(
  rows: TRow[],
  rowId: string,
  position: "above" | "below",
  createRow: () => TRow,
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const insertIndex =
    rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
  const nextRows = [...rows];
  nextRows.splice(insertIndex, 0, createRow());
  return nextRows;
}

function moveEntryRow<TRow extends { id: string }>(
  rows: TRow[],
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

function removeEntryRow<TRow extends { id: string }>(
  rows: TRow[],
  rowId: string,
  createFallbackRow: () => TRow,
) {
  const nextRows = rows.filter((row) => row.id !== rowId);
  return nextRows.length > 0 ? nextRows : [createFallbackRow()];
}

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];

function createBlankPurchaseRequestItem(): PurchaseRequestItem {
  return {
    ...emptyPurchaseRequestItem,
    id: createPurchaseRequestId("item"),
  };
}

function normalizeEntry(entry: PurchaseRequestItem): PurchaseRequestItem {
  return {
    ...entry,
    cost: Number(entry.cost) || 0,
    quantity: Number(entry.quantity) || 0,
  };
}

function shouldClearEntry(
  entry: PurchaseRequestItem,
  action: Exclude<ModuleDataEntryClearAction, "all">,
  isServices = false,
) {
  const hasData = purchaseRequestEntryHasData(entry);

  if (action === "with-data") {
    return hasData;
  }

  if (action === "incomplete") {
    return hasData && !purchaseRequestEntryIsComplete(entry, isServices);
  }

  return !hasData;
}

function purchaseRequestEntryHasData(entry: PurchaseRequestItem) {
  return Boolean(
    entry.itemCode.trim() ||
    entry.barcode.trim() ||
    entry.description.trim() ||
    entry.lotNo.trim() ||
    entry.expiryDate.trim() ||
    entry.responsibilityCenter.trim() ||
    Number(entry.quantity) ||
    Number(entry.cost),
  );
}

function purchaseRequestEntryIsComplete(entry: PurchaseRequestItem, isServices = false) {
  return Boolean(
    (isServices || entry.itemCode.trim()) &&
    entry.description.trim() &&
    (isServices || entry.uom.trim()) &&
    Number(entry.quantity) > 0 &&
    Number(entry.cost) >= 0,
  );
}
