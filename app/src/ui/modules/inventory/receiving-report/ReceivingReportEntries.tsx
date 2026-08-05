"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Gift } from "lucide-react";
import {
  createReceivingReportAccountingEntry,
  createReceivingReportLine,
  type ReceivingReportAccountingEntry,
  type ReceivingReportLine,
  type ReceivingReportTotals,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
  MoneyNumberField,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ReceivingReportEntryTab = "items" | "accounting";
type ReceivingReportLineField = keyof ReceivingReportLine;
type ReceivingReportAccountingEntryField = keyof ReceivingReportAccountingEntry;
type ReceivingReportColumnKind = "amount" | "date" | "dropdown" | "text";

type ReceivingReportColumnConfig = {
  header: string;
  id: ReceivingReportLineField;
  kind: ReceivingReportColumnKind;
  options?: AppAdvancedDropdownOption[];
  width: number;
  widthClassName: string;
};

type ReceivingReportAccountingColumnConfig = {
  header: string;
  id: ReceivingReportAccountingEntryField;
  kind: "amount" | "text";
  width: number;
  widthClassName: string;
};

type ReceivingReportEntryUpdater = (
  rowId: string,
  field: ReceivingReportLineField,
  value: string,
) => void;

type ReceivingReportAccountingEntryUpdater = (
  rowId: string,
  field: ReceivingReportAccountingEntryField,
  value: string,
) => void;

export function ReceivingReportEntries({
  accountingEntries,
  error,
  isReadonly,
  onAccountingRowsChange,
  onRowsChange,
  onUpdateAccountingEntry,
  onUpdateLine,
  rows,
  totals,
}: {
  accountingEntries: ReceivingReportAccountingEntry[];
  error?: string;
  isReadonly: boolean;
  onAccountingRowsChange: (rows: ReceivingReportAccountingEntry[]) => void;
  onRowsChange: (rows: ReceivingReportLine[]) => void;
  onUpdateAccountingEntry: ReceivingReportAccountingEntryUpdater;
  onUpdateLine: ReceivingReportEntryUpdater;
  rows: ReceivingReportLine[];
  totals: ReceivingReportTotals;
}) {
  const [activeEntryTab, setActiveEntryTab] = useState<ReceivingReportEntryTab>("items");
  const tabs = (
    <ReceivingReportEntryTabs activeTab={activeEntryTab} onTabChange={setActiveEntryTab} />
  );

  if (activeEntryTab === "accounting") {
    return (
      <ReceivingReportAccountingEntries
        isReadonly={isReadonly}
        rows={accountingEntries}
        title={tabs}
        onRowsChange={onAccountingRowsChange}
        onUpdateEntry={onUpdateAccountingEntry}
      />
    );
  }

  return (
    <ReceivingReportItemEntries
      error={error}
      isReadonly={isReadonly}
      rows={rows}
      title={tabs}
      totals={totals}
      onRowsChange={onRowsChange}
      onUpdateLine={onUpdateLine}
    />
  );
}

function ReceivingReportEntryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ReceivingReportEntryTab;
  onTabChange: (tab: ReceivingReportEntryTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Receiving report row entry sections"
      className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {ReceivingReportEntryTabsList.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={joinClasses(
              "h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ReceivingReportItemEntries({
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

      if (isVisible) {
        next.add(columnId);
      } else {
        next.delete(columnId);
      }

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

    if (!row) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, {
      ...row,
      id: createReceivingReportLine().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(position === "above" ? rowIndex : rowIndex + 1, 0, createReceivingReportLine());
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportLine()]);
  }

  return (
    <div className="grid gap-5">
      {error ? <ErrorText message={error} /> : null}
      <ModuleDataEntry
        description=""
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
          discountAmount: formatAmount(totals.discountAmount),
          ewtAmount: formatAmount(totals.ewtAmount),
          grossAmount: formatAmount(totals.grossAmount),
          netAmount: formatAmount(totals.netAmount),
          vatAmount: formatAmount(totals.vatAmount),
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

function ReceivingReportAccountingEntries({
  isReadonly,
  onRowsChange,
  onUpdateEntry,
  rows,
  title,
}: {
  isReadonly: boolean;
  onRowsChange: (rows: ReceivingReportAccountingEntry[]) => void;
  onUpdateEntry: ReceivingReportAccountingEntryUpdater;
  rows: ReceivingReportAccountingEntry[];
  title: ReactNode;
}) {
  const updateEntry = useCallback(
    (rowId: string, field: ReceivingReportAccountingEntryField, value: string) => {
      onUpdateEntry(rowId, field, value);
    },
    [onUpdateEntry],
  );
  const columns = useMemo<ModuleDataEntryColumn<ReceivingReportAccountingEntry>[]>(
    () => createReceivingReportAccountingColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(
    () => new Set(DefaultVisibleReceivingReportAccountingColumns),
  );
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIds.has(column.id)),
    [columns, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !ProtectedReceivingReportAccountingColumns.has(column.id),
        isVisible: visibleColumnIds.has(column.id),
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns, visibleColumnIds],
  );

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    setVisibleColumnIds((current) => {
      if (!isVisible && ProtectedReceivingReportAccountingColumns.has(columnId)) {
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

  function addRows(count: number) {
    onRowsChange([
      ...rows,
      ...Array.from({ length: count }, () => createReceivingReportAccountingEntry()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createReceivingReportAccountingEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearAccountingEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportAccountingEntry()]);
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
      id: createReceivingReportAccountingEntry().id,
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
      createReceivingReportAccountingEntry(),
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createReceivingReportAccountingEntry()]);
  }

  return (
    <ModuleDataEntry
      description=""
      columns={visibleColumns}
      columnOptions={columnOptions}
      emptyRowLabel="accounting entry"
      exportOptions={[
        { id: "csv", label: "CSV", onSelect: () => undefined },
        { id: "excel", label: "Excel", onSelect: () => undefined },
        { id: "pdf", label: "PDF", onSelect: () => undefined },
      ]}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
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
  );
}

function createReceivingReportAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: ReceivingReportAccountingEntryUpdater,
): ModuleDataEntryColumn<ReceivingReportAccountingEntry>[] {
  return ReceivingReportAccountingColumnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row) => (
      <ReceivingReportAccountingEntryCell
        column={column}
        isReadonly={isReadonly}
        row={row}
        onUpdateEntry={onUpdateEntry}
      />
    ),
  }));
}

function ReceivingReportAccountingEntryCell({
  column,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: ReceivingReportAccountingColumnConfig;
  isReadonly: boolean;
  onUpdateEntry: ReceivingReportAccountingEntryUpdater;
  row: ReceivingReportAccountingEntry;
}) {
  const value = row[column.id];

  if (column.kind === "amount") {
    return (
      <EntryAmountInput
        value={value}
        readOnly={isReadonly}
        onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  return (
    <EntryInput
      type="text"
      value={value}
      readOnly={isReadonly}
      onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
    />
  );
}

function ReceivingReportEntryCell({
  column,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: ReceivingReportColumnConfig;
  isReadonly: boolean;
  onUpdateEntry: ReceivingReportEntryUpdater;
  row: ReceivingReportLine;
}) {
  const value = row[column.id];

  if (column.kind === "dropdown") {
    return (
      <EntryDropdown
        options={column.options ?? []}
        readOnly={isReadonly}
        value={value}
        onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  if (column.kind === "amount") {
    return (
      <EntryAmountInput
        value={value}
        readOnly={isReadonly}
        onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  return (
    <EntryInput
      type={column.kind === "date" ? "date" : "text"}
      value={value}
      readOnly={isReadonly}
      onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
    />
  );
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
  type,
  value,
}: {
  onChange: (value: string) => void;
  readOnly: boolean;
  type: "date" | "text";
  value: string;
}) {
  return (
    <input
      type={type}
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

function ErrorText({ message }: { message: string }) {
  return <span className="mt-1 block text-xs font-semibold text-red-600">{message}</span>;
}

function receivingReportColumn(
  header: string,
  id: ReceivingReportLineField,
  kind: ReceivingReportColumnKind,
  width: number,
  widthClassName: string,
  options?: AppAdvancedDropdownOption[],
): ReceivingReportColumnConfig {
  return {
    header,
    id,
    kind,
    options,
    width,
    widthClassName,
  };
}


function receivingReportAccountingColumn(
  header: string,
  id: ReceivingReportAccountingEntryField,
  kind: "amount" | "text",
  width: number,
  widthClassName: string,
): ReceivingReportAccountingColumnConfig {
  return {
    header,
    id,
    kind,
    width,
    widthClassName,
  };
}


function dropdownOptions(options: readonly string[]): AppAdvancedDropdownOption[] {
  return options.map((option) => ({
    label: option,
    name: option,
    value: option,
  }));
}


function receivingReportEntryHasData(entry: ReceivingReportLine) {
  return Object.entries(entry).some(([key, value]) => {
    if (key === "id") {
      return false;
    }

    return String(value).trim().length > 0 && !DefaultEmptyValues.has(String(value));
  });
}


function receivingReportEntryIsComplete(entry: ReceivingReportLine) {
  return (
    entry.itemCode.trim().length > 0 &&
    entry.description.trim().length > 0 &&
    parseMoneyNumberInput(entry.rrQty) > 0
  );
}


function shouldClearReceivingReportEntry(
  entry: ReceivingReportLine,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return receivingReportEntryHasData(entry);
  }

  if (action === "incomplete") {
    return receivingReportEntryHasData(entry) && !receivingReportEntryIsComplete(entry);
  }

  return !receivingReportEntryHasData(entry);
}


function accountingEntryHasData(entry: ReceivingReportAccountingEntry) {
  return Object.entries(entry).some(([key, value]) => {
    if (key === "id") {
      return false;
    }

    return String(value).trim().length > 0 && !DefaultEmptyValues.has(String(value));
  });
}


function shouldClearAccountingEntry(
  entry: ReceivingReportAccountingEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return accountingEntryHasData(entry);
  }

  if (action === "incomplete") {
    return (
      accountingEntryHasData(entry) && (!entry.accountCode.trim() || !entry.accountTitle.trim())
    );
  }

  return !accountingEntryHasData(entry);
}


function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}


function formatAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}


const ReceivingReportEntryTabsList = [
  { id: "items", label: "Item Entry" },
  { id: "accounting", label: "Accounting Entry" },
] satisfies Array<{ id: ReceivingReportEntryTab; label: string }>;

const UomOptions = ["", "PCS", "BOX", "KG", "LTR"] as const;

const DefaultEmptyValues = new Set(["0.00", "0.0000", "False", "Laguna"]);
const DefaultHiddenReceivingReportItemColumns = new Set<string>([
  "barcode",
  "expiryDate",
  "lotNo",
  "color",
  "brand",
  "size",
  "model",
]);
const DefaultVisibleReceivingReportAccountingColumns = new Set<string>([
  "accountTitle",
  "debit",
  "credit",
  "particulars",
]);
const ProtectedReceivingReportAccountingColumns = new Set<string>([
  "accountTitle",
  "debit",
  "credit",
]);


const ReceivingReportItemColumnConfigs = [
  receivingReportColumn("Item Code *", "itemCode", "text", 150, "w-[9.5rem]"),
  receivingReportColumn("Barcode", "barcode", "text", 130, "w-[8rem]"),
  receivingReportColumn("Item Name *", "description", "text", 220, "w-[13.75rem]"),
  receivingReportColumn("PO Qty", "poQty", "amount", 105, "w-[6.5rem]"),
  receivingReportColumn("RR Qty *", "rrQty", "amount", 110, "w-[7rem]"),
  receivingReportColumn("UOM *", "uom", "dropdown", 105, "w-[6.5rem]", dropdownOptions(UomOptions)),
  receivingReportColumn("Expiration Date", "expiryDate", "date", 125, "w-[7.75rem]"),
  receivingReportColumn("Lot No", "lotNo", "text", 105, "w-[6.5rem]"),
  receivingReportColumn("Color", "color", "text", 95, "w-[6rem]"),
  receivingReportColumn("Brand", "brand", "text", 95, "w-[6rem]"),
  receivingReportColumn("Size", "size", "text", 90, "w-[5.75rem]"),
  receivingReportColumn("Model", "model", "text", 110, "w-[7rem]"),
  receivingReportColumn("UC *", "cost", "amount", 110, "w-[7rem]"),
  receivingReportColumn("Total Cost (Net of VAT)", "grossAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("VAT Amt", "vatAmount", "amount", 130, "w-[8rem]"),
  receivingReportColumn("Total Cost (Gross of VAT)", "netAmount", "amount", 160, "w-[10rem]"),
];

const ReceivingReportAccountingColumnConfigs = [
  receivingReportAccountingColumn("Account Code", "accountCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("Account Title", "accountTitle", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("Debit", "debit", "amount", 130, "w-[8rem]"),
  receivingReportAccountingColumn("Credit", "credit", "amount", 130, "w-[8rem]"),
  receivingReportAccountingColumn("Party Code", "partyCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("Party Name", "partyName", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("Particulars", "particulars", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("VAT Type", "vatType", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("EWT Code", "ewtCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn(
    "Responsibility Center",
    "responsibilityCenter",
    "text",
    190,
    "w-[12rem]",
  ),
  receivingReportAccountingColumn("Reference No.", "referenceNo", "text", 160, "w-[10rem]"),
];

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";


