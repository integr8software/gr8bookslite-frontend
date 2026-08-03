import { useCallback, useMemo } from "react";
import {
  createPurchaseRequestId,
  emptyPurchaseRequestItem,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestItem } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createPurchaseRequestLineColumns } from "@/app/src/ui/modules/purchasing/purchase-request/entries/PurchaseRequestLineColumns";

type PurchaseRequestEntrySectionProps = {
  error?: string;
  isReadonly: boolean;
  rows: PurchaseRequestItem[];
  onRowsChange: (rows: PurchaseRequestItem[]) => void;
};

export function PurchaseRequestEntrySection({
  error,
  isReadonly,
  onRowsChange,
  rows,
}: PurchaseRequestEntrySectionProps) {
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<PurchaseRequestItem>) => {
      onRowsChange(
        rows.map((row) => (row.id === rowId ? normalizeEntry({ ...row, ...updates }) : row)),
      );
    },
    [onRowsChange, rows],
  );
  const columns = useMemo<ModuleDataEntryColumn<PurchaseRequestItem>[]>(
    () => createPurchaseRequestLineColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
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

    const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
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
        { id: "csv", label: "CSV", onSelect: () => undefined },
        { id: "excel", label: "Excel", onSelect: () => undefined },
        { id: "pdf", label: "PDF", onSelect: () => undefined },
      ]}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      title="Items"
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
) {
  const hasData = purchaseRequestEntryHasData(entry);

  if (action === "with-data") {
    return hasData;
  }

  if (action === "incomplete") {
    return hasData && !purchaseRequestEntryIsComplete(entry);
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

function purchaseRequestEntryIsComplete(entry: PurchaseRequestItem) {
  return Boolean(
    entry.itemCode.trim() &&
    entry.description.trim() &&
    entry.uom.trim() &&
    Number(entry.quantity) > 0 &&
    Number(entry.cost) >= 0,
  );
}
