"use client";

import { useCallback, useMemo } from "react";
import {
  billingInvoiceEntryHasData,
  billingInvoiceEntryIsComplete,
  calculateBillingInvoiceTotals,
  createBlankBillingInvoiceLineEntry,
  formatBillingInvoiceAmount,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { BillingInvoiceLineEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createBillingInvoiceServiceDetailColumns } from "@/app/src/ui/modules/sales/billing-invoice/entries/BillingInvoiceServiceDetailColumns";

type Props = {
  isReadonly: boolean;
  rows: BillingInvoiceLineEntry[];
  onRowsChange: (rows: BillingInvoiceLineEntry[]) => void;
};

export function SalesQuotationServicesEntries({ isReadonly, onRowsChange, rows }: Props) {
  const updateEntry = useCallback(
    (id: string, updates: Partial<BillingInvoiceLineEntry>) => {
      onRowsChange(rows.map((row) => (row.id === id ? recalculate({ ...row, ...updates }) : row)));
    },
    [onRowsChange, rows],
  );
  const totals = useMemo(() => calculateBillingInvoiceTotals(rows), [rows]);
  const columns = useMemo<ModuleDataEntryColumn<BillingInvoiceLineEntry>[]>(
    () =>
      createBillingInvoiceServiceDetailColumns(isReadonly, updateEntry).map((column) => ({
        ...column,
        header: column.id === "itemNo" ? "Service No" : column.id === "itemName" ? "Service Name" : column.header,
      })),
    [isReadonly, updateEntry],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: false,
        isVisible: true,
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns],
  );

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="service"
      exportOptions={[
        { id: "csv", label: "CSV", onSelect: () => undefined },
        { id: "excel", label: "Excel", onSelect: () => undefined },
        { id: "pdf", label: "PDF", onSelect: () => undefined },
      ]}
      footerDetails={
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
          <span>Sales Discount: {formatBillingInvoiceAmount(totals.discountAmount)}</span>
          <span>Net Amount: {formatBillingInvoiceAmount(totals.grossAmount)}</span>
        </div>
      }
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{
        discountAmount: formatBillingInvoiceAmount(totals.discountAmount),
        grossAmount: formatBillingInvoiceAmount(totals.grossAmount),
        netAmount: formatBillingInvoiceAmount(totals.netAmount),
        vatAmount: formatBillingInvoiceAmount(totals.vatAmount),
        vatInclusiveAmount: formatBillingInvoiceAmount(totals.netAmount + totals.vatAmount),
      }}
      summaryRowHeader="Total"
      title="Services"
      onAddRows={(count) => onRowsChange([...rows, ...Array.from({ length: count }, createBlankBillingInvoiceLineEntry)])}
      onAutoColumnWidth={() => undefined}
      onClearRows={(action) => onRowsChange(clearRows(action, rows))}
      onDuplicateRow={(id) => onRowsChange(duplicateRow(id, rows))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(id, position) => onRowsChange(insertRow(id, position, rows))}
      onMoveRow={(fromId, toId) => onRowsChange(moveRow(fromId, toId, rows))}
      onRemoveRow={(id) => onRowsChange(rows.length > 1 ? rows.filter((row) => row.id !== id) : rows)}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function recalculate(entry: BillingInvoiceLineEntry): BillingInvoiceLineEntry {
  const amount = parseMoneyNumberInput(entry.amount);
  const quantity = parseMoneyNumberInput(entry.quantity);
  const netAmount = amount > 0 ? amount * Math.max(quantity, 1) : parseMoneyNumberInput(entry.netAmount);
  const grossAmount = Math.max(netAmount + parseMoneyNumberInput(entry.vatAmount) - parseMoneyNumberInput(entry.discountAmount), 0);
  return { ...entry, grossAmount: grossAmount.toFixed(2), netAmount: netAmount.toFixed(2) };
}
function clearRows(action: ModuleDataEntryClearAction, rows: BillingInvoiceLineEntry[]) {
  if (action === "all") return [createBlankBillingInvoiceLineEntry()];
  const next = rows.filter(
    (row) =>
      !(action === "with-data"
        ? billingInvoiceEntryHasData(row)
        : action === "incomplete"
          ? billingInvoiceEntryHasData(row) && !billingInvoiceEntryIsComplete(row)
          : !billingInvoiceEntryHasData(row)),
  );
  return next.length ? next : [createBlankBillingInvoiceLineEntry()];
}
function duplicateRow(id: string, rows: BillingInvoiceLineEntry[]) {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return rows;
  const next = [...rows];
  next.splice(index + 1, 0, { ...rows[index], id: createBlankBillingInvoiceLineEntry().id });
  return next;
}
function insertRow(id: string, position: "above" | "below", rows: BillingInvoiceLineEntry[]) {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return rows;
  const next = [...rows];
  next.splice(position === "above" ? index : index + 1, 0, createBlankBillingInvoiceLineEntry());
  return next;
}
function moveRow(fromId: string, toId: string, rows: BillingInvoiceLineEntry[]) {
  const from = rows.findIndex((row) => row.id === fromId);
  const to = rows.findIndex((row) => row.id === toId);
  if (from < 0 || to < 0 || from === to) return rows;
  const next = [...rows];
  const [row] = next.splice(from, 1);
  if (row) next.splice(to, 0, row);
  return next;
}
