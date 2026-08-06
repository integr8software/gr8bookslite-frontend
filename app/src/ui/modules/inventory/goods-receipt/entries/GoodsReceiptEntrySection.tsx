import { useCallback, useMemo, useState } from "react";
import {
  calculateGoodsReceiptTotals,
  createBlankGoodsReceiptAccountingEntry,
  createBlankGoodsReceiptLineEntry,
  formatGoodsReceiptAmount,
  GoodsReceiptPartyOptions,
  GoodsReceiptResponsibilityCenterOptions,
  goodsReceiptEntryHasData,
  goodsReceiptEntryIsComplete,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type {
  GoodsReceiptAccountingEntry,
  GoodsReceiptEntryTab,
  GoodsReceiptLineEntry,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { AccountingEntryTable } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTable";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { createGoodsReceiptLineColumns } from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptLineColumns";
import { GoodsReceiptEntryTabs } from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptEntryTabs";

type GoodsReceiptEntrySectionProps = {
  accountingRows: GoodsReceiptAccountingEntry[];
  isReadonly: boolean;
  rows: GoodsReceiptLineEntry[];
  onAccountingRowsChange: (rows: GoodsReceiptAccountingEntry[]) => void;
  onRowsChange: (rows: GoodsReceiptLineEntry[]) => void;
};

export function GoodsReceiptEntrySection({
  accountingRows,
  isReadonly,
  onAccountingRowsChange,
  onRowsChange,
  rows,
}: GoodsReceiptEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<GoodsReceiptEntryTab>("goods");
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<GoodsReceiptLineEntry>) => {
      onRowsChange(rows.map((row) => (row.id === rowId ? recalculateEntry({ ...row, ...updates }) : row)));
    },
    [onRowsChange, rows],
  );
  const totals = useMemo(() => calculateGoodsReceiptTotals(rows), [rows]);
  const columns = useMemo<ModuleDataEntryColumn<GoodsReceiptLineEntry>[]>(
    () => createGoodsReceiptLineColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !["itemCode", "itemName", "receivedQuantity"].includes(column.id),
        isVisible: true,
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns],
  );

  if (activeTab === "accounting") {
    return (
      <AccountingEntryTable
        createBlankRow={createBlankGoodsReceiptAccountingEntry}
        description="Record goods receipt accounting distributions."
        fieldOptions={{
          partyName: GoodsReceiptPartyOptions,
          vatType: GoodsReceiptVatTypeOptions,
          atcCode: GoodsReceiptTaxTypeOptions,
          responsibilityCenter: GoodsReceiptResponsibilityCenterOptions,
        }}
        isReadonly={isReadonly}
        readOnlyFields={["partyCode"]}
        rows={accountingRows}
        title={<GoodsReceiptEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
        onFieldChange={(_row, columnId, value) => {
          if (columnId !== "partyName") return undefined;

          return {
            partyCode: GoodsReceiptPartyOptions.find((option) => option.value === value)?.value ?? "",
            partyName: value,
          };
        }}
        onRowsChange={onAccountingRowsChange}
      />
    );
  }

  function addRows(count: number) {
    onRowsChange([...rows, ...Array.from({ length: count }, () => createBlankGoodsReceiptLineEntry())]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankGoodsReceiptLineEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankGoodsReceiptLineEntry()]);
  }

  function duplicateRow(rowId: string) {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];

    if (!row) return;

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, {
      ...row,
      id: createBlankGoodsReceiptLineEntry().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) return;

    const nextRows = [...rows];
    nextRows.splice(position === "above" ? rowIndex : rowIndex + 1, 0, createBlankGoodsReceiptLineEntry());
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankGoodsReceiptLineEntry()]);
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="goods receipt line"
      exportOptions={EntryExportOptions}
      footerDetails={
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
          <span>Received Qty: {formatGoodsReceiptAmount(totals.receivedQuantity)}</span>
          <span>Amount: {formatGoodsReceiptAmount(totals.amount)}</span>
        </div>
      }
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{
        amount: formatGoodsReceiptAmount(totals.amount),
        receivedQuantity: formatGoodsReceiptAmount(totals.receivedQuantity),
      }}
      title={<GoodsReceiptEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
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

const GoodsReceiptVatTypeOptions = [
  { name: "VATable", value: "VATable" },
  { name: "Zero Rated", value: "Zero Rated" },
  { name: "Exempt", value: "Exempt" },
];

const GoodsReceiptTaxTypeOptions = [
  { name: "None", value: "" },
  { name: "WI010", value: "WI010", label: "Professional fees" },
  { name: "WC158", value: "WC158", label: "Goods" },
];

function recalculateEntry(entry: GoodsReceiptLineEntry): GoodsReceiptLineEntry {
  const receivedQuantity = parseMoneyNumberInput(entry.receivedQuantity);
  const unitCost = parseMoneyNumberInput(entry.unitCost);

  return {
    ...entry,
    amount: receivedQuantity > 0 && unitCost > 0 ? (receivedQuantity * unitCost).toFixed(2) : entry.amount,
  };
}

function shouldClearEntry(entry: GoodsReceiptLineEntry, action: Exclude<ModuleDataEntryClearAction, "all">) {
  if (action === "with-data") return goodsReceiptEntryHasData(entry);
  if (action === "incomplete") {
    return goodsReceiptEntryHasData(entry) && !goodsReceiptEntryIsComplete(entry);
  }

  return !goodsReceiptEntryHasData(entry);
}

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
