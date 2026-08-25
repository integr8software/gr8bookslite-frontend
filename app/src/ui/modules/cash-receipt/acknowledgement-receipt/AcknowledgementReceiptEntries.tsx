import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  calculateAcknowledgementReceiptTotals,
  createBlankAcknowledgementReceiptLineEntry,
  formatAcknowledgementReceiptAmount,
  acknowledgementReceiptEntryHasData,
  acknowledgementReceiptEntryIsComplete,
  AcknowledgementReceiptCollectionTypeOptions,
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
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const AcknowledgementReceiptAccountingColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "collectionType",
  "referenceNo",
] as const;

type AcknowledgementReceiptAccountingColumnId =
  (typeof AcknowledgementReceiptAccountingColumnIds)[number];

const AcknowledgementReceiptAccountingProtectedColumnIds =
  new Set<AcknowledgementReceiptAccountingColumnId>([
    "accountTitle",
    "debit",
    "credit",
  ]);

const AcknowledgementReceiptAccountingDefaultVisibleColumnIds = [
  "accountTitle",
  "debit",
  "credit",
  "collectionType",
] as const satisfies readonly AcknowledgementReceiptAccountingColumnId[];

const AcknowledgementReceiptAccountingColumnLabels: Record<
  AcknowledgementReceiptAccountingColumnId,
  string
> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  collectionType: "Particulars",
  referenceNo: "Reference No",
  debit: "Debit",
  credit: "Credit",
};

const AcknowledgementReceiptAccountingColumnWidths: Record<
  AcknowledgementReceiptAccountingColumnId,
  number
> = {
  accountCode: 160,
  accountTitle: 260,
  collectionType: 320,
  referenceNo: 160,
  debit: 160,
  credit: 160,
};

const AcknowledgementReceiptCollectionEntryView: AcknowledgementReceiptEntryView =
  "collection";
const AcknowledgementReceiptAccountingEntryView: AcknowledgementReceiptEntryView =
  "accounting";

type AcknowledgementReceiptEntriesProps = {
  entryView: AcknowledgementReceiptEntryView;
  isReadonly: boolean;
  paymentType: string;
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
  paymentType,
  rows,
}: AcknowledgementReceiptEntriesProps) {
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<
    AcknowledgementReceiptAccountingColumnId[]
  >([...AcknowledgementReceiptAccountingColumnIds]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
    AcknowledgementReceiptAccountingColumnId[]
  >([...AcknowledgementReceiptAccountingDefaultVisibleColumnIds]);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState<
    Record<AcknowledgementReceiptAccountingColumnId, string>
  >({ ...AcknowledgementReceiptAccountingColumnLabels });
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<
    Record<AcknowledgementReceiptAccountingColumnId, number>
  >({ ...AcknowledgementReceiptAccountingColumnWidths });
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
      entryView === AcknowledgementReceiptCollectionEntryView
        ? createCollectionColumns(isReadonly, updateEntry, isCheckPaymentType(paymentType))
        : createAccountingColumns(
            isReadonly,
            updateEntry,
            accountingColumnOrder,
            visibleAccountingColumnIds,
            accountingColumnLabels,
            accountingColumnWidths,
          ),
    [
      accountingColumnLabels,
      accountingColumnOrder,
      accountingColumnWidths,
      entryView,
      isReadonly,
      paymentType,
      updateEntry,
      visibleAccountingColumnIds,
    ],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () => {
      if (entryView !== AcknowledgementReceiptAccountingEntryView) {
        return [];
      }

      return accountingColumnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !AcknowledgementReceiptAccountingProtectedColumnIds.has(
          columnId,
        ),
        isVisible: visibleAccountingColumnIds.includes(columnId),
        label: accountingColumnLabels[columnId],
        width: accountingColumnWidths[columnId],
        widthMode: "fixed",
      }));
    },
    [
      accountingColumnLabels,
      accountingColumnOrder,
      accountingColumnWidths,
      entryView,
      visibleAccountingColumnIds,
    ],
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

  function updateAccountingColumnHeader(columnId: string, header: string) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateAccountingColumnWidth(columnId: string, width: number) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitAccountingColumnWidth(columnId: string) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
      return;
    }

    updateAccountingColumnWidth(
      columnId,
      calculateAccountingColumnFitWidth({
        columnId,
        columnLabels: accountingColumnLabels,
        rows,
      }),
    );
  }

  function moveAccountingColumn(fromColumnId: string, toColumnId: string) {
    if (
      !isAcknowledgementReceiptAccountingColumnId(fromColumnId) ||
      !isAcknowledgementReceiptAccountingColumnId(toColumnId)
    ) {
      return;
    }

    setAccountingColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...AcknowledgementReceiptAccountingColumnIds]);
    setVisibleAccountingColumnIds([
      ...AcknowledgementReceiptAccountingDefaultVisibleColumnIds,
    ]);
    setAccountingColumnLabels({
      ...AcknowledgementReceiptAccountingColumnLabels,
    });
    setAccountingColumnWidths({
      ...AcknowledgementReceiptAccountingColumnWidths,
    });
  }

  function toggleAccountingColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
      return;
    }

    if (
      !isVisible &&
      AcknowledgementReceiptAccountingProtectedColumnIds.has(columnId)
    ) {
      return;
    }

    setVisibleAccountingColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(
        currentVisibleIds,
        accountingColumnOrder,
        columnId,
        isVisible,
      ),
    );
  }

  const accountingColumnHandlers =
    entryView === AcknowledgementReceiptAccountingEntryView
      ? {
          onAutoColumnWidth: fitAccountingColumnWidth,
          onFitColumnWidth: fitAccountingColumnWidth,
          onMoveColumn: moveAccountingColumn,
          onResetColumns: resetAccountingColumns,
          onToggleColumnVisibility: toggleAccountingColumnVisibility,
          onUpdateColumnHeader: updateAccountingColumnHeader,
          onUpdateColumnWidth: updateAccountingColumnWidth,
        }
      : {};

  return (
    <ModuleDataEntry
      columns={columns}
      columnResetLabel="Default"
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="entry"
      exportOptions={
        entryView === AcknowledgementReceiptCollectionEntryView
          ? [
              { id: "csv", label: "CSV", onSelect: () => undefined },
              { id: "excel", label: "Excel", onSelect: () => undefined },
              { id: "pdf", label: "PDF", onSelect: () => undefined },
            ]
          : []
      }
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
      canConfigureColumnsWhenReadonly={
        entryView === AcknowledgementReceiptAccountingEntryView
      }
      rows={rows}
      summaryCells={
        entryView === AcknowledgementReceiptAccountingEntryView
          ? {
              credit: formatAcknowledgementReceiptAmount(totals.credit),
              debit: formatAcknowledgementReceiptAmount(totals.debit),
            }
          : undefined
      }
      toolbarActions={
        entryView === AcknowledgementReceiptCollectionEntryView
          ? [
              {
                id: "add-collection-type",
                icon: Plus,
                label: "Add Collection Type",
                onSelect: onOpenCollectionTypeDialog,
              },
            ]
          : []
      }
      title={
        <EntryViewTabs entryView={entryView} onEntryViewChange={onEntryViewChange} />
      }
      onAddRows={addRows}
      onClearRows={clearRows}
      onDuplicateRow={duplicateRow}
      onImport={
        entryView === AcknowledgementReceiptCollectionEntryView
          ? () => undefined
          : undefined
      }
      onInsertRow={insertRow}
      onMoveRow={moveRow}
      onRemoveRow={removeRow}
      {...accountingColumnHandlers}
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
        [AcknowledgementReceiptCollectionEntryView, "Collection Details"],
        [AcknowledgementReceiptAccountingEntryView, "Accounting Entries"],
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
  shouldShowCheckColumns: boolean,
): ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[] {
  const checkColumns: ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[] = shouldShowCheckColumns
    ? [
        {
          header: "Bank Name",
          id: "bankName",
          width: 190,
          widthClassName: "w-[12rem]",
          renderCell: (row) => (
            <EntryInput
              value={row.bankName}
              readOnly={isReadonly}
              onChange={(bankName) => onUpdateEntry(row.id, { bankName })}
            />
          ),
        },
        {
          header: "Check No.",
          id: "checkNo",
          width: 160,
          widthClassName: "w-[10rem]",
          renderCell: (row) => (
            <EntryInput
              value={row.checkNo}
              readOnly={isReadonly}
              onChange={(checkNo) => onUpdateEntry(row.id, { checkNo })}
            />
          ),
        },
        {
          header: "Check Date",
          id: "checkDate",
          width: 150,
          widthClassName: "w-[9.5rem]",
          renderCell: (row) => (
            <EntryDateInput
              value={row.checkDate}
              readOnly={isReadonly}
              onChange={(checkDate) => onUpdateEntry(row.id, { checkDate })}
            />
          ),
        },
      ]
    : [];

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
    ...checkColumns,
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
  columnOrder: AcknowledgementReceiptAccountingColumnId[],
  visibleColumnIds: readonly AcknowledgementReceiptAccountingColumnId[],
  columnLabels: Record<AcknowledgementReceiptAccountingColumnId, string>,
  columnWidths: Record<AcknowledgementReceiptAccountingColumnId, number>,
): ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !AcknowledgementReceiptAccountingProtectedColumnIds.has(
        columnId,
      ),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderAccountingCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

function renderAccountingCell(
  row: AcknowledgementReceiptLineEntry,
  columnId: AcknowledgementReceiptAccountingColumnId,
  isReadonly: boolean,
  onUpdateEntry: (
    rowId: string,
    updates: Partial<AcknowledgementReceiptLineEntry>,
  ) => void,
) {
  switch (columnId) {
    case "accountCode":
      return (
        <EntryInput
          value={row.accountCode}
          readOnly={isReadonly}
          onChange={(accountCode) => onUpdateEntry(row.id, { accountCode })}
        />
      );
    case "accountTitle":
      return (
        <EntryInput
          value={row.accountTitle}
          readOnly={isReadonly}
          onChange={(accountTitle) => onUpdateEntry(row.id, { accountTitle })}
        />
      );
    case "collectionType":
      return (
        <EntryInput
          value={row.collectionType}
          readOnly={isReadonly}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      );
    case "referenceNo":
      return (
        <EntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
    case "debit":
      return (
        <EntryAmountInput
          value={row.debit}
          readOnly={isReadonly}
          onValueChange={(debit) => onUpdateEntry(row.id, { debit })}
        />
      );
    case "credit":
      return (
        <EntryAmountInput
          value={row.credit}
          readOnly={isReadonly}
          onValueChange={(credit) => onUpdateEntry(row.id, { credit })}
        />
      );
  }
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

function EntryDateInput({
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
      type="date"
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className={entryCellControlClassName()}
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

function isCheckPaymentType(paymentType: string) {
  return paymentType.trim().toLowerCase().includes("check");
}

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function isAcknowledgementReceiptAccountingColumnId(
  columnId: string,
): columnId is AcknowledgementReceiptAccountingColumnId {
  return AcknowledgementReceiptAccountingColumnIds.includes(
    columnId as AcknowledgementReceiptAccountingColumnId,
  );
}

function getAccountingExportCell(
  entry: AcknowledgementReceiptLineEntry,
  columnId: AcknowledgementReceiptAccountingColumnId,
) {
  return String(entry[columnId] ?? "");
}

function calculateAccountingColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: AcknowledgementReceiptAccountingColumnId;
  columnLabels: Record<AcknowledgementReceiptAccountingColumnId, string>;
  rows: AcknowledgementReceiptLineEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = rows.reduce(
    (currentWidth, row) =>
      Math.max(
        currentWidth,
        estimateTextWidth(getAccountingExportCell(row, columnId), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

function moveColumnId<TColumnId extends string>(
  columnOrder: TColumnId[],
  fromColumnId: TColumnId,
  toColumnId: TColumnId,
) {
  const fromIndex = columnOrder.indexOf(fromColumnId);
  const toIndex = columnOrder.indexOf(toColumnId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return columnOrder;
  }

  const nextOrder = [...columnOrder];
  const [movedColumn] = nextOrder.splice(fromIndex, 1);

  nextOrder.splice(toIndex, 0, movedColumn);
  return nextOrder;
}

function updateVisibleColumnIds<TColumnId extends string>(
  visibleColumnIds: TColumnId[],
  columnOrder: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
) {
  if (isVisible) {
    const nextVisibleIds = new Set([...visibleColumnIds, columnId]);

    return columnOrder.filter((currentColumnId) =>
      nextVisibleIds.has(currentColumnId),
    );
  }

  if (visibleColumnIds.length <= 1) {
    return visibleColumnIds;
  }

  return visibleColumnIds.filter((currentColumnId) => currentColumnId !== columnId);
}
