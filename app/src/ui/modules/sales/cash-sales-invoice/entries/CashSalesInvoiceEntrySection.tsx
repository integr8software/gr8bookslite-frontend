import { useCallback, useMemo } from "react";
import {
  createBlankCashSalesInvoiceLineEntry,
  formatCashSalesInvoiceCurrency,
} from "@/app/src/data/modules/sales/cash-sales-invoice/CashSalesInvoiceData";
import type {
  CashSalesInvoiceEntryTab,
  CashSalesInvoiceFormValues,
  CashSalesInvoiceLineEntry,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
  formatMoneyNumberInput,
  MoneyNumberField,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import { CashSalesInvoiceEntryTabs } from "@/app/src/ui/modules/sales/cash-sales-invoice/entries/CashSalesInvoiceEntryTabs";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type CashSalesInvoiceEntrySectionProps = {
  activeTab: CashSalesInvoiceEntryTab;
  isReadonly: boolean;
  values: CashSalesInvoiceFormValues;
  onRowsChange: (rows: CashSalesInvoiceLineEntry[]) => void;
  onTabChange: (tab: CashSalesInvoiceEntryTab) => void;
};

export function CashSalesInvoiceEntrySection({
  activeTab,
  isReadonly,
  onRowsChange,
  onTabChange,
  values,
}: CashSalesInvoiceEntrySectionProps) {
  const rows = values.lineEntries;
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<CashSalesInvoiceLineEntry>) => {
      onRowsChange(
        rows.map((row) => (row.id === rowId ? normalizeEntry({ ...row, ...updates }) : row)),
      );
    },
    [onRowsChange, rows],
  );
  const columns = useMemo(
    () => createLineColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !["description", "quantity", "grossAmount"].includes(column.id),
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
      emptyRowLabel="cash sales invoice line"
      exportOptions={EntryExportOptions}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={createSummaryCells(rows)}
      title={
        <CashSalesInvoiceEntryTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      }
      onAddRows={(count) =>
        onRowsChange([
          ...rows,
          ...Array.from({ length: count }, () => createBlankCashSalesInvoiceLineEntry()),
        ])
      }
      onAutoColumnWidth={() => undefined}
      onClearRows={() => onRowsChange([createBlankCashSalesInvoiceLineEntry()])}
      onDuplicateRow={(rowId) => onRowsChange(duplicateRow(rows, rowId))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) =>
        onRowsChange(insertRow(rows, rowId, position))
      }
      onMoveRow={(fromRowId, toRowId) =>
        onRowsChange(moveRow(rows, fromRowId, toRowId))
      }
      onRemoveRow={(rowId) => onRowsChange(removeRow(rows, rowId))}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

type LineColumnKind = "amount" | "select" | "text";

type LineColumnConfig = {
  header: string;
  id: keyof CashSalesInvoiceLineEntry;
  kind: LineColumnKind;
  width: number;
  widthClassName: string;
};

function createLineColumns(
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<CashSalesInvoiceLineEntry>) => void,
): ModuleDataEntryColumn<CashSalesInvoiceLineEntry>[] {
  return LineColumnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row, _index, context) => (
      <LineCell
        column={column}
        fieldId={context.fieldId}
        fieldName={context.fieldName}
        isReadonly={isReadonly}
        row={row}
        onUpdateEntry={onUpdateEntry}
      />
    ),
  }));
}

function LineCell({
  column,
  fieldId,
  fieldName,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: LineColumnConfig;
  fieldId: string;
  fieldName: string;
  isReadonly: boolean;
  onUpdateEntry: (rowId: string, updates: Partial<CashSalesInvoiceLineEntry>) => void;
  row: CashSalesInvoiceLineEntry;
}) {
  const value = String(row[column.id] ?? "");

  if (column.kind === "select") {
    return (
      <AppAdvancedDropdown
        id={fieldId}
        name={fieldName}
        value={value}
        readOnly={isReadonly}
        options={["PC", "BOX", "SET", "LOT"].map((option) => ({
          name: option,
          value: option,
        }))}
        placeholder=""
        className={EntryDropdownClassName}
        onChange={(nextValue) =>
          onUpdateEntry(row.id, { [column.id]: String(nextValue) })
        }
      />
    );
  }

  if (column.kind === "amount") {
    return (
      <MoneyNumberField
        id={fieldId}
        name={fieldName}
        value={formatMoneyNumberInput(value)}
        readOnly={isReadonly}
        onValueChange={(nextValue) =>
          onUpdateEntry(row.id, { [column.id]: nextValue })
        }
        className={entryCellControlClassName("text-right tabular-nums")}
      />
    );
  }

  return (
    <input
      id={fieldId}
      name={fieldName}
      type="text"
      value={value}
      readOnly={isReadonly}
      onChange={(event) => onUpdateEntry(row.id, { [column.id]: event.target.value })}
      className={entryCellControlClassName()}
    />
  );
}

const LineColumnConfigs = [
  column("Item Code", "itemCode", "text", 150, "w-[9.5rem]"),
  column("Description", "description", "text", 280, "w-[17.5rem]"),
  column("Particulars", "particulars", "text", 260, "w-[16.25rem]"),
  column("Qty", "quantity", "amount", 120, "w-[7.5rem]"),
  column("UOM", "uom", "select", 120, "w-[7.5rem]"),
  column("Unit Price", "unitPrice", "amount", 150, "w-[9.5rem]"),
  column("Gross Amount", "grossAmount", "amount", 160, "w-[10rem]"),
  column("VAT Amount", "vatAmount", "amount", 150, "w-[9.5rem]"),
  column("EWT Amount", "ewtAmount", "amount", 150, "w-[9.5rem]"),
  column("Discount", "discountAmount", "amount", 150, "w-[9.5rem]"),
  column("Net Amount", "netAmount", "amount", 160, "w-[10rem]"),
  column("Res. Center", "responsibilityCenter", "text", 190, "w-[12rem]"),
] satisfies LineColumnConfig[];

function column(
  header: string,
  id: keyof CashSalesInvoiceLineEntry,
  kind: LineColumnKind,
  width: number,
  widthClassName: string,
): LineColumnConfig {
  return { header, id, kind, width, widthClassName };
}

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function normalizeEntry(entry: CashSalesInvoiceLineEntry): CashSalesInvoiceLineEntry {
  const quantity = parseMoneyNumberInput(entry.quantity);
  const unitPrice = parseMoneyNumberInput(entry.unitPrice);
  const grossAmount = parseMoneyNumberInput(entry.grossAmount) || quantity * unitPrice;
  const discountAmount = parseMoneyNumberInput(entry.discountAmount);

  return {
    ...entry,
    grossAmount: grossAmount.toFixed(2),
    netAmount: (
      parseMoneyNumberInput(entry.netAmount) || Math.max(grossAmount - discountAmount, 0)
    ).toFixed(2),
  };
}

function createSummaryCells(rows: CashSalesInvoiceLineEntry[]) {
  const totals = rows.reduce(
    (summary, row) => ({
      grossAmount: summary.grossAmount + parseMoneyNumberInput(row.grossAmount),
      netAmount: summary.netAmount + parseMoneyNumberInput(row.netAmount),
      vatAmount: summary.vatAmount + parseMoneyNumberInput(row.vatAmount),
    }),
    { grossAmount: 0, netAmount: 0, vatAmount: 0 },
  );

  return {
    description: "Totals",
    grossAmount: formatCashSalesInvoiceCurrency(totals.grossAmount),
    netAmount: formatCashSalesInvoiceCurrency(totals.netAmount),
    vatAmount: formatCashSalesInvoiceCurrency(totals.vatAmount),
  };
}

function duplicateRow(rows: CashSalesInvoiceLineEntry[], rowId: string) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const row = rows[rowIndex];
  if (!row) return rows;
  const nextRows = [...rows];
  nextRows.splice(rowIndex + 1, 0, {
    ...row,
    id: createBlankCashSalesInvoiceLineEntry().id,
  });
  return nextRows;
}

function insertRow(
  rows: CashSalesInvoiceLineEntry[],
  rowId: string,
  position: "above" | "below",
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const insertIndex = rowIndex < 0 ? rows.length : rowIndex + (position === "below" ? 1 : 0);
  const nextRows = [...rows];
  nextRows.splice(insertIndex, 0, createBlankCashSalesInvoiceLineEntry());
  return nextRows;
}

function moveRow(rows: CashSalesInvoiceLineEntry[], fromRowId: string, toRowId: string) {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return rows;
  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);
  if (!movedRow) return rows;
  nextRows.splice(toIndex, 0, movedRow);
  return nextRows;
}

function removeRow(rows: CashSalesInvoiceLineEntry[], rowId: string) {
  const nextRows = rows.filter((row) => row.id !== rowId);
  return nextRows.length > 0 ? nextRows : [createBlankCashSalesInvoiceLineEntry()];
}

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
