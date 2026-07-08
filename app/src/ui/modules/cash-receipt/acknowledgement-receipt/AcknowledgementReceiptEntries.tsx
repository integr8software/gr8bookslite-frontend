import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import {
  calculateAcknowledgementReceiptTotals,
  createBlankAcknowledgementReceiptLineEntry,
  formatAcknowledgementReceiptAmount,
  acknowledgementReceiptEntryHasData,
  acknowledgementReceiptEntryIsComplete,
  AcknowledgementReceiptCollectionTypeOptions,
  AcknowledgementReceiptPartyOptions,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import type {
  AcknowledgementReceiptEntryView,
  AcknowledgementReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
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
import {
  MoneyNumberField,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type AcknowledgementReceiptEntriesProps = {
  entryView: AcknowledgementReceiptEntryView;
  isReadonly: boolean;
  rows: AcknowledgementReceiptLineEntry[];
  onEntryViewChange: (view: AcknowledgementReceiptEntryView) => void;
  onOpenCollectionTypeDialog: () => void;
  onRowsChange: (rows: AcknowledgementReceiptLineEntry[]) => void;
};

export function AcknowledgementReceiptEntries({
  entryView,
  isReadonly,
  onEntryViewChange,
  onOpenCollectionTypeDialog,
  onRowsChange,
  rows,
}: AcknowledgementReceiptEntriesProps) {
  const updateEntry = useCallback((
    rowId: string,
    updates: Partial<AcknowledgementReceiptLineEntry>,
  ) => {
    onRowsChange(
      rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
    );
  }, [onRowsChange, rows]);
  const totals = useMemo(() => calculateAcknowledgementReceiptTotals(rows), [rows]);
  const variance = Math.abs(totals.debit - totals.credit);
  const columns = useMemo<ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[]>(
    () =>
      entryView === "collection"
        ? createCollectionColumns(isReadonly, updateEntry)
        : createAccountingColumns(isReadonly, updateEntry),
    [entryView, isReadonly, updateEntry],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !["collectionType", "accountCode", "accountTitle"].includes(
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
      ...Array.from({ length: count }, () => createBlankAcknowledgementReceiptLineEntry()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankAcknowledgementReceiptLineEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankAcknowledgementReceiptLineEntry()]);
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
      id: createBlankAcknowledgementReceiptLineEntry().id,
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
      createBlankAcknowledgementReceiptLineEntry(),
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankAcknowledgementReceiptLineEntry()]);
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="entry"
      exportOptions={[
        { id: "csv", label: "CSV", onSelect: () => undefined },
        { id: "excel", label: "Excel", onSelect: () => undefined },
        { id: "pdf", label: "PDF", onSelect: () => undefined },
      ]}
      footerDetails={
        <span
          className={joinClasses(
            "text-sm font-semibold",
            variance < 0.001 ? "text-emerald-700" : "text-coralpink",
          )}
        >
          Variance: {formatAcknowledgementReceiptAmount(variance)}
        </span>
      }
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={
        entryView === "accounting"
          ? {
              credit: formatAcknowledgementReceiptAmount(totals.credit),
              debit: formatAcknowledgementReceiptAmount(totals.debit),
            }
          : undefined
      }
      toolbarActions={[
        {
          id: "add-collection-type",
          icon: Plus,
          label: "Add Collection Type",
          onSelect: onOpenCollectionTypeDialog,
        },
      ]}
      title={
        <EntryViewTabs entryView={entryView} onEntryViewChange={onEntryViewChange} />
      }
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

function EntryViewTabs({
  entryView,
  onEntryViewChange,
}: {
  entryView: AcknowledgementReceiptEntryView;
  onEntryViewChange: (view: AcknowledgementReceiptEntryView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Entry view"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {([
        ["collection", "Collection Details"],
        ["accounting", "Accounting Entries"],
      ] as const).map(([view, label]) => {
        const isActive = entryView === view;

        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onEntryViewChange(view)}
            className={joinClasses(
              "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function createCollectionColumns(
  isReadonly: boolean,
  onUpdateEntry: (
    rowId: string,
    updates: Partial<AcknowledgementReceiptLineEntry>,
  ) => void,
): ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[] {
  return [
    {
      header: "Collection Type",
      id: "collectionType",
      width: 220,
      widthClassName: "w-[14rem]",
      renderCell: (row) => (
        <EntryDropdown
          options={AcknowledgementReceiptCollectionTypeOptions}
          placeholder="Enter collection type"
          readOnly={isReadonly}
          value={row.collectionType}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      ),
    },
    {
      header: "Gross Receipt",
      id: "grossReceipt",
      width: 150,
      widthClassName: "w-[9.5rem]",
      renderCell: (row) => (
        <EntryAmountInput
          value={row.grossReceipt}
          readOnly={isReadonly}
          onValueChange={(grossReceipt) => onUpdateEntry(row.id, { grossReceipt })}
        />
      ),
    },
    {
      header: "VAT Exempt",
      id: "vatExempt",
      width: 140,
      widthClassName: "w-[9rem]",
      renderCell: (row) => (
        <EntryAmountInput
          value={row.vatExempt}
          readOnly={isReadonly}
          onValueChange={(vatExempt) => onUpdateEntry(row.id, { vatExempt })}
        />
      ),
    },
    {
      header: "VAT",
      id: "vat",
      width: 130,
      widthClassName: "w-[8rem]",
      renderCell: (row) => (
        <EntryAmountInput
          value={row.vat}
          readOnly={isReadonly}
          onValueChange={(vat) => onUpdateEntry(row.id, { vat })}
        />
      ),
    },
    {
      header: "EWT",
      id: "ewt",
      width: 130,
      widthClassName: "w-[8rem]",
      renderCell: (row) => (
        <EntryAmountInput
          value={row.ewt}
          readOnly={isReadonly}
          onValueChange={(ewt) => onUpdateEntry(row.id, { ewt })}
        />
      ),
    },
    {
      header: "For Payment",
      id: "forPayment",
      width: 140,
      widthClassName: "w-[9rem]",
      renderCell: (row) => (
        <div className="flex h-10 w-full items-center justify-end bg-offwhite/45 px-3 text-sm font-medium tabular-nums text-darknavy/70">
          {formatAcknowledgementReceiptAmount(
            parseMoneyNumberInput(row.grossReceipt) +
              parseMoneyNumberInput(row.vat) -
              parseMoneyNumberInput(row.ewt),
          )}
        </div>
      ),
    },
    {
      header: "VCE Name",
      id: "customerName",
      width: 220,
      widthClassName: "w-[14rem]",
      renderCell: (row) => (
        <EntryDropdown
          options={AcknowledgementReceiptPartyOptions}
          placeholder="Select Party Name"
          readOnly={isReadonly}
          value={row.customerName}
          onChange={(customerName) => onUpdateEntry(row.id, { customerName })}
        />
      ),
    },
    {
      header: "Reference No.",
      id: "referenceNo",
      width: 160,
      widthClassName: "w-[10rem]",
      renderCell: (row) => (
        <EntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      ),
    },
  ];
}

function createAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: (
    rowId: string,
    updates: Partial<AcknowledgementReceiptLineEntry>,
  ) => void,
): ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[] {
  return [
    {
      header: "Account Code",
      id: "accountCode",
      width: 150,
      widthClassName: "w-[9.5rem]",
      renderCell: (row) => (
        <EntryInput
          value={row.accountCode}
          readOnly={isReadonly}
          onChange={(accountCode) => onUpdateEntry(row.id, { accountCode })}
        />
      ),
    },
    {
      header: "Account Title",
      id: "accountTitle",
      width: 240,
      widthClassName: "w-[15rem]",
      renderCell: (row) => (
        <EntryInput
          value={row.accountTitle}
          readOnly={isReadonly}
          onChange={(accountTitle) => onUpdateEntry(row.id, { accountTitle })}
        />
      ),
    },
    {
      header: "Particulars",
      id: "collectionType",
      width: 260,
      widthClassName: "w-[16rem]",
      renderCell: (row) => (
        <EntryInput
          value={row.collectionType}
          readOnly={isReadonly}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      ),
    },
    {
      header: "Reference No.",
      id: "referenceNo",
      width: 160,
      widthClassName: "w-[10rem]",
      renderCell: (row) => (
        <EntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      ),
    },
    {
      header: "Debit",
      id: "debit",
      width: 150,
      widthClassName: "w-[9.5rem]",
      renderCell: (row) => (
        <EntryAmountInput
          value={row.debit}
          readOnly={isReadonly}
          onValueChange={(debit) => onUpdateEntry(row.id, { debit })}
        />
      ),
    },
    {
      header: "Credit",
      id: "credit",
      width: 150,
      widthClassName: "w-[9.5rem]",
      renderCell: (row) => (
        <EntryAmountInput
          value={row.credit}
          readOnly={isReadonly}
          onValueChange={(credit) => onUpdateEntry(row.id, { credit })}
        />
      ),
    },
  ];
}

function EntryDropdown({
  onChange,
  options,
  placeholder,
  readOnly,
  value,
}: {
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  placeholder: string;
  readOnly: boolean;
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      className={EntryDropdownClassName}
      value={value}
      options={options}
      placeholder={placeholder}
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
  entry: AcknowledgementReceiptLineEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return acknowledgementReceiptEntryHasData(entry);
  }

  if (action === "incomplete") {
    return (
      acknowledgementReceiptEntryHasData(entry) &&
      !acknowledgementReceiptEntryIsComplete(entry)
    );
  }

  return !acknowledgementReceiptEntryHasData(entry);
}

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
