import { useCallback, useMemo } from "react";
import {
  calculateSalesInvoiceTotals,
  createBlankSalesInvoiceLineItem,
  formatSalesInvoiceCurrency,
  SalesInvoiceBooleanOptions,
  SalesInvoiceEwtTypeOptions,
  SalesInvoiceResCenterOptions,
  SalesInvoiceUomOptions,
  SalesInvoiceVatTypeOptions,
  salesInvoiceLineHasData,
  salesInvoiceLineIsComplete,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceData";
import type { SalesInvoiceLineItem } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type SalesInvoiceEntriesProps = {
  isReadonly: boolean;
  rows: SalesInvoiceLineItem[];
  onRowsChange: (rows: SalesInvoiceLineItem[]) => void;
};

export function SalesInvoiceEntries({
  isReadonly,
  onRowsChange,
  rows,
}: SalesInvoiceEntriesProps) {
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<SalesInvoiceLineItem>) => {
      onRowsChange(
        rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
      );
    },
    [onRowsChange, rows],
  );
  const totals = useMemo(() => calculateSalesInvoiceTotals(rows), [rows]);
  const columns = useMemo<ModuleDataEntryColumn<SalesInvoiceLineItem>[]>(
    () => createSalesInvoiceColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !["itemCode", "name", "quantity", "price"].includes(
          column.id,
        ),
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
      ...Array.from({ length: count }, () => createBlankSalesInvoiceLineItem()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankSalesInvoiceLineItem()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankSalesInvoiceLineItem()]);
  }

  function duplicateRow(rowId: string) {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];

    if (!row) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, {
      ...row,
      id: createBlankSalesInvoiceLineItem().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(
      position === "above" ? rowIndex : rowIndex + 1,
      0,
      createBlankSalesInvoiceLineItem(),
    );
    onRowsChange(nextRows);
  }

  function moveRow(fromRowId: string, toRowId: string) {
    const fromIndex = rows.findIndex((row) => row.id === fromRowId);
    const toIndex = rows.findIndex((row) => row.id === toRowId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const nextRows = [...rows];
    const [movedRow] = nextRows.splice(fromIndex, 1);

    if (!movedRow) {
      return;
    }

    nextRows.splice(toIndex, 0, movedRow);
    onRowsChange(nextRows);
  }

  function removeRow(rowId: string) {
    const nextRows = rows.filter((row) => row.id !== rowId);
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankSalesInvoiceLineItem()]);
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="item"
      exportOptions={[
        { id: "csv", label: "CSV", onSelect: () => undefined },
        { id: "excel", label: "Excel", onSelect: () => undefined },
        { id: "pdf", label: "PDF", onSelect: () => undefined },
      ]}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Amount Due: {formatSalesInvoiceCurrency(totals.netAmount + totals.vatAmount)}
        </span>
      }
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{
        amountDue: (totals.netAmount + totals.vatAmount).toFixed(2),
        discount: totals.discount.toFixed(2),
        totalSales: totals.grossAmount.toFixed(2),
        vatAmount: totals.vatAmount.toFixed(2),
      }}
      title="Item Entries"
      onAddRows={addRows}
      onClearRows={clearRows}
      onDuplicateRow={duplicateRow}
      onImport={() => undefined}
      onInsertRow={insertRow}
      onMoveRow={moveRow}
      onRemoveRow={removeRow}
      onAutoColumnWidth={() => undefined}
      onFitColumnWidth={() => undefined}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function createSalesInvoiceColumns(
  isReadonly: boolean,
  onUpdateEntry: (
    rowId: string,
    updates: Partial<SalesInvoiceLineItem>,
  ) => void,
): ModuleDataEntryColumn<SalesInvoiceLineItem>[] {
  return [
    textColumn("itemCode", "Item Code", 140, isReadonly, onUpdateEntry),
    textColumn("barcode", "Barcode", 140, isReadonly, onUpdateEntry),
    textColumn("name", "Name", 220, isReadonly, onUpdateEntry),
    amountColumn("quantity", "QTY", 120, isReadonly, onUpdateEntry),
    selectColumn("uom", "UOM", 130, SalesInvoiceUomOptions, isReadonly, onUpdateEntry),
    amountColumn("returnQuantity", "Return QTY", 130, isReadonly, onUpdateEntry),
    amountColumn("price", "Price", 140, isReadonly, onUpdateEntry),
    amountColumn("totalSales", "Total Sales", 150, isReadonly, onUpdateEntry),
    amountColumn("vatAmount", "VAT Amount", 150, isReadonly, onUpdateEntry),
    amountColumn("ewtAmount", "EWT Amount", 150, isReadonly, onUpdateEntry),
    amountColumn("discount", "Discount", 140, isReadonly, onUpdateEntry),
    amountColumn("amountDue", "Amount Due", 150, isReadonly, onUpdateEntry),
    selectColumn("vatType", "VAT Type", 150, SalesInvoiceVatTypeOptions, isReadonly, onUpdateEntry),
    selectColumn("vatable", "VATable", 120, SalesInvoiceBooleanOptions, isReadonly, onUpdateEntry),
    selectColumn("vatInc", "VAT Inc.", 120, SalesInvoiceBooleanOptions, isReadonly, onUpdateEntry),
    selectColumn("withEwt", "With EWT", 120, SalesInvoiceBooleanOptions, isReadonly, onUpdateEntry),
    selectColumn("ewtType", "EWT Type", 120, SalesInvoiceEwtTypeOptions, isReadonly, onUpdateEntry),
    selectColumn("resCenter", "Res. Center", 220, SalesInvoiceResCenterOptions, isReadonly, onUpdateEntry),
    textColumn("refNo", "Ref. No.", 180, isReadonly, onUpdateEntry),
  ];
}

function textColumn(
  id: keyof SalesInvoiceLineItem,
  header: string,
  width: number,
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<SalesInvoiceLineItem>) => void,
): ModuleDataEntryColumn<SalesInvoiceLineItem> {
  return {
    header,
    id,
    width,
    widthClassName: `w-[${width / 16}rem]`,
    renderCell: (row) => (
      <EntryInput
        value={String(row[id])}
        readOnly={isReadonly}
        onChange={(value) => onUpdateEntry(row.id, { [id]: value })}
      />
    ),
  };
}

function amountColumn(
  id: keyof SalesInvoiceLineItem,
  header: string,
  width: number,
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<SalesInvoiceLineItem>) => void,
): ModuleDataEntryColumn<SalesInvoiceLineItem> {
  return {
    header,
    id,
    width,
    widthClassName: `w-[${width / 16}rem]`,
    renderCell: (row) => (
      <EntryAmountInput
        value={String(row[id])}
        readOnly={isReadonly}
        onValueChange={(value) => onUpdateEntry(row.id, { [id]: value })}
      />
    ),
  };
}

function selectColumn(
  id: keyof SalesInvoiceLineItem,
  header: string,
  width: number,
  options: AppAdvancedDropdownOption[],
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<SalesInvoiceLineItem>) => void,
): ModuleDataEntryColumn<SalesInvoiceLineItem> {
  return {
    header,
    id,
    width,
    widthClassName: `w-[${width / 16}rem]`,
    renderCell: (row) => (
      <EntryDropdown
        options={options}
        readOnly={isReadonly}
        value={String(row[id])}
        onChange={(value) => onUpdateEntry(row.id, { [id]: value })}
      />
    ),
  };
}

function EntryDropdown({
  onChange,
  options,
  readOnly,
  value,
}: {
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      className={EntryDropdownClassName}
      value={value}
      options={options}
      placeholder=""
      readOnly={readOnly}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

function EntryInput({
  onChange,
  readOnly,
  value,
}: {
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={entryCellControlClassName()}
    />
  );
}

function EntryAmountInput({
  onValueChange,
  readOnly,
  value,
}: {
  onValueChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <MoneyNumberField
      value={value}
      readOnly={readOnly}
      onValueChange={onValueChange}
      className={entryCellControlClassName("text-right tabular-nums")}
    />
  );
}

function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function shouldClearEntry(
  entry: SalesInvoiceLineItem,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return salesInvoiceLineHasData(entry);
  }

  if (action === "incomplete") {
    return salesInvoiceLineHasData(entry) && !salesInvoiceLineIsComplete(entry);
  }

  return !salesInvoiceLineHasData(entry);
}

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
