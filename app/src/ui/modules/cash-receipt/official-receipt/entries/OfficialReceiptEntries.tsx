import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  calculateOfficialReceiptCwtAmount,
  calculateOfficialReceiptNetOfVat,
  calculateOfficialReceiptTotalReceived,
  calculateOfficialReceiptTotals,
  calculateOfficialReceiptVatAmount,
  createBlankOfficialReceiptLineEntry,
  formatOfficialReceiptAmount,
  officialReceiptEntryHasData,
  officialReceiptEntryIsComplete,
  OfficialReceiptCwtCodeOptions,
  OfficialReceiptCollectionTypeOptions,
  OfficialReceiptVatTypeOptions,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type {
  OfficialReceiptEntryView,
  OfficialReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  OfficialReceiptEntryAmountInput,
  OfficialReceiptEntryDropdown,
  OfficialReceiptEntryInput,
  OfficialReceiptEntryPercentInput,
  OfficialReceiptEntryReadOnlyAmount,
} from "@/app/src/ui/modules/cash-receipt/official-receipt/entries/OfficialReceiptEntryCellControls";

const OfficialReceiptCollectionColumnIds = [
  "collectionType",
  "grossReceipt",
  "netOfVat",
  "vatType",
  "vatPercent",
  "vatAmount",
  "cwtCode",
  "cwtPercent",
  "cwtAmount",
  "totalReceived",
  "partyCode",
  "partyName",
  "particulars",
  "responsibilityCenter",
  "referenceNo",
] as const;

type OfficialReceiptCollectionColumnId =
  (typeof OfficialReceiptCollectionColumnIds)[number];

const OfficialReceiptCollectionProtectedColumnIds =
  new Set<OfficialReceiptCollectionColumnId>([
    "collectionType",
    "grossReceipt",
    "netOfVat",
    "vatAmount",
    "cwtAmount",
  ]);

const OfficialReceiptCollectionDefaultVisibleColumnIds = [
  "collectionType",
  "grossReceipt",
  "netOfVat",
  "vatAmount",
  "cwtAmount",
  "totalReceived",
  "partyName",
  "particulars",
  "responsibilityCenter",
  "referenceNo",
] as const satisfies readonly OfficialReceiptCollectionColumnId[];

const OfficialReceiptCollectionColumnLabels: Record<
  OfficialReceiptCollectionColumnId,
  string
> = {
  collectionType: "Collection Type",
  grossReceipt: "Gross Receipt",
  netOfVat: "Net of VAT",
  vatType: "VAT Type",
  vatPercent: "VAT %",
  vatAmount: "VAT Amount",
  cwtCode: "CWT Code",
  cwtPercent: "CWT %",
  cwtAmount: "CWT Amount",
  totalReceived: "Total Received",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  responsibilityCenter: "Responsibility Center",
  referenceNo: "Reference No",
};

const OfficialReceiptCollectionColumnWidths: Record<
  OfficialReceiptCollectionColumnId,
  number
> = {
  collectionType: 190,
  grossReceipt: 150,
  netOfVat: 150,
  vatType: 170,
  vatPercent: 120,
  vatAmount: 150,
  cwtCode: 140,
  cwtPercent: 120,
  cwtAmount: 150,
  totalReceived: 160,
  partyCode: 140,
  partyName: 190,
  particulars: 220,
  responsibilityCenter: 190,
  referenceNo: 160,
};

const OfficialReceiptAccountingColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "cwtCode",
  "responsibilityCenter",
  "referenceNo",
] as const;

type OfficialReceiptAccountingColumnId =
  (typeof OfficialReceiptAccountingColumnIds)[number];

const OfficialReceiptAccountingProtectedColumnIds =
  new Set<OfficialReceiptAccountingColumnId>([
    "accountCode",
    "accountTitle",
    "debit",
    "credit",
    "particulars",
  ]);

const OfficialReceiptAccountingDefaultVisibleColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const satisfies readonly OfficialReceiptAccountingColumnId[];

const OfficialReceiptAccountingColumnLabels: Record<
  OfficialReceiptAccountingColumnId,
  string
> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  vatType: "VAT Type",
  cwtCode: "CWT Code",
  responsibilityCenter: "Responsibility Center",
  referenceNo: "Reference No",
  debit: "Debit",
  credit: "Credit",
};

const OfficialReceiptAccountingColumnWidths: Record<
  OfficialReceiptAccountingColumnId,
  number
> = {
  accountCode: 160,
  accountTitle: 260,
  partyCode: 150,
  partyName: 190,
  particulars: 300,
  vatType: 170,
  cwtCode: 140,
  responsibilityCenter: 190,
  referenceNo: 160,
  debit: 160,
  credit: 160,
};

const OfficialReceiptCollectionEntryView: OfficialReceiptEntryView = "collection";
const OfficialReceiptAccountingEntryView: OfficialReceiptEntryView = "accounting";

type OfficialReceiptEntriesProps = {
  entryView: OfficialReceiptEntryView;
  isReadonly: boolean;
  rows: OfficialReceiptLineEntry[];
  onEntryViewChange: (view: OfficialReceiptEntryView) => void;
  onOpenCollectionTypeDialog: () => void;
  onRowsChange: (rows: OfficialReceiptLineEntry[]) => void;
};

export function OfficialReceiptEntries({
  entryView,
  isReadonly,
  onEntryViewChange,
  onOpenCollectionTypeDialog,
  onRowsChange,
  rows,
}: OfficialReceiptEntriesProps) {
  const [collectionColumnOrder, setCollectionColumnOrder] = useState<
    OfficialReceiptCollectionColumnId[]
  >([...OfficialReceiptCollectionColumnIds]);
  const [visibleCollectionColumnIds, setVisibleCollectionColumnIds] = useState<
    OfficialReceiptCollectionColumnId[]
  >([...OfficialReceiptCollectionDefaultVisibleColumnIds]);
  const [collectionColumnLabels, setCollectionColumnLabels] = useState<
    Record<OfficialReceiptCollectionColumnId, string>
  >({ ...OfficialReceiptCollectionColumnLabels });
  const [collectionColumnWidths, setCollectionColumnWidths] = useState<
    Record<OfficialReceiptCollectionColumnId, number>
  >({ ...OfficialReceiptCollectionColumnWidths });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<
    OfficialReceiptAccountingColumnId[]
  >([...OfficialReceiptAccountingColumnIds]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
    OfficialReceiptAccountingColumnId[]
  >([...OfficialReceiptAccountingDefaultVisibleColumnIds]);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState<
    Record<OfficialReceiptAccountingColumnId, string>
  >({ ...OfficialReceiptAccountingColumnLabels });
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<
    Record<OfficialReceiptAccountingColumnId, number>
  >({ ...OfficialReceiptAccountingColumnWidths });
  const updateEntry = useCallback((
    rowId: string,
    updates: Partial<OfficialReceiptLineEntry>,
  ) => {
    onRowsChange(
      rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
    );
  }, [onRowsChange, rows]);
  const totals = useMemo(() => calculateOfficialReceiptTotals(rows), [rows]);
  const variance = Math.abs(totals.debit - totals.credit);
  const accountingRows = useMemo(() => createAccountingRows(rows), [rows]);
  const columns = useMemo<ModuleDataEntryColumn<OfficialReceiptLineEntry>[]>(
    () =>
      entryView === OfficialReceiptCollectionEntryView
        ? createCollectionColumns(
            isReadonly,
            updateEntry,
            collectionColumnOrder,
            visibleCollectionColumnIds,
            collectionColumnLabels,
            collectionColumnWidths,
          )
        : createAccountingColumns(
            true,
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
      collectionColumnLabels,
      collectionColumnOrder,
      collectionColumnWidths,
      entryView,
      isReadonly,
      updateEntry,
      visibleAccountingColumnIds,
      visibleCollectionColumnIds,
    ],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () => {
      if (entryView === OfficialReceiptCollectionEntryView) {
        return collectionColumnOrder.map((columnId) => ({
          id: columnId,
          isHideable: !OfficialReceiptCollectionProtectedColumnIds.has(columnId),
          isVisible: visibleCollectionColumnIds.includes(columnId),
          label: collectionColumnLabels[columnId],
          width: collectionColumnWidths[columnId],
          widthMode: "fixed",
        }));
      }

      return accountingColumnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !OfficialReceiptAccountingProtectedColumnIds.has(columnId),
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
      collectionColumnLabels,
      collectionColumnOrder,
      collectionColumnWidths,
      entryView,
      visibleAccountingColumnIds,
      visibleCollectionColumnIds,
    ],
  );

  function addRows(count: number) {
    onRowsChange([
      ...rows,
      ...Array.from({ length: count }, () => createBlankOfficialReceiptLineEntry()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankOfficialReceiptLineEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankOfficialReceiptLineEntry()]);
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
      id: createBlankOfficialReceiptLineEntry().id,
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
      createBlankOfficialReceiptLineEntry(),
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankOfficialReceiptLineEntry()]);
  }

  function updateCollectionColumnHeader(columnId: string, header: string) {
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateCollectionColumnWidth(columnId: string, width: number) {
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitCollectionColumnWidth(columnId: string) {
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
      return;
    }

    updateCollectionColumnWidth(
      columnId,
      calculateCollectionColumnFitWidth({
        columnId,
        columnLabels: collectionColumnLabels,
        rows,
      }),
    );
  }

  function moveCollectionColumn(fromColumnId: string, toColumnId: string) {
    if (
      !isOfficialReceiptCollectionColumnId(fromColumnId) ||
      !isOfficialReceiptCollectionColumnId(toColumnId)
    ) {
      return;
    }

    setCollectionColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function resetCollectionColumns() {
    setCollectionColumnOrder([...OfficialReceiptCollectionColumnIds]);
    setVisibleCollectionColumnIds([
      ...OfficialReceiptCollectionDefaultVisibleColumnIds,
    ]);
    setCollectionColumnLabels({ ...OfficialReceiptCollectionColumnLabels });
    setCollectionColumnWidths({ ...OfficialReceiptCollectionColumnWidths });
  }

  function toggleCollectionColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
      return;
    }

    if (!isVisible && OfficialReceiptCollectionProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleCollectionColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(
        currentVisibleIds,
        collectionColumnOrder,
        columnId,
        isVisible,
      ),
    );
  }

  function updateAccountingColumnHeader(columnId: string, header: string) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateAccountingColumnWidth(columnId: string, width: number) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitAccountingColumnWidth(columnId: string) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
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
      !isOfficialReceiptAccountingColumnId(fromColumnId) ||
      !isOfficialReceiptAccountingColumnId(toColumnId)
    ) {
      return;
    }

    setAccountingColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...OfficialReceiptAccountingColumnIds]);
    setVisibleAccountingColumnIds([
      ...OfficialReceiptAccountingDefaultVisibleColumnIds,
    ]);
    setAccountingColumnLabels({ ...OfficialReceiptAccountingColumnLabels });
    setAccountingColumnWidths({ ...OfficialReceiptAccountingColumnWidths });
  }

  function toggleAccountingColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && OfficialReceiptAccountingProtectedColumnIds.has(columnId)) {
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

  const columnHandlers =
    entryView === OfficialReceiptCollectionEntryView
      ? {
          onAutoColumnWidth: fitCollectionColumnWidth,
          onFitColumnWidth: fitCollectionColumnWidth,
          onMoveColumn: moveCollectionColumn,
          onResetColumns: resetCollectionColumns,
          onToggleColumnVisibility: toggleCollectionColumnVisibility,
          onUpdateColumnHeader: updateCollectionColumnHeader,
          onUpdateColumnWidth: updateCollectionColumnWidth,
        }
      : {
          onAutoColumnWidth: fitAccountingColumnWidth,
          onFitColumnWidth: fitAccountingColumnWidth,
          onMoveColumn: moveAccountingColumn,
          onResetColumns: resetAccountingColumns,
          onToggleColumnVisibility: toggleAccountingColumnVisibility,
          onUpdateColumnHeader: updateAccountingColumnHeader,
          onUpdateColumnWidth: updateAccountingColumnWidth,
        };

  return (
    <ModuleDataEntry
      columns={columns}
      columnResetLabel="Default"
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="entry"
      exportOptions={
        entryView === OfficialReceiptCollectionEntryView
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
          Variance: {formatOfficialReceiptAmount(variance)}
        </span>
      }
      isDraggable
      isReadonly={entryView === OfficialReceiptAccountingEntryView ? true : isReadonly}
      canConfigureColumnsWhenReadonly
      rows={entryView === OfficialReceiptAccountingEntryView ? accountingRows : rows}
      summaryCells={
        entryView === OfficialReceiptAccountingEntryView
          ? {
              credit: formatOfficialReceiptAmount(totals.credit),
              debit: formatOfficialReceiptAmount(totals.debit),
              particulars:
                variance < 0.001
                  ? "Balanced"
                  : `Difference: ${formatOfficialReceiptAmount(variance)}`,
            }
          : undefined
      }
      toolbarActions={
        entryView === OfficialReceiptCollectionEntryView
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
        entryView === OfficialReceiptCollectionEntryView
          ? () => undefined
          : undefined
      }
      onInsertRow={insertRow}
      onMoveRow={moveRow}
      onRemoveRow={removeRow}
      {...columnHandlers}
    />
  );
}

function EntryViewTabs({
  entryView,
  onEntryViewChange,
}: {
  entryView: OfficialReceiptEntryView;
  onEntryViewChange: (view: OfficialReceiptEntryView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Entry view"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {([
        [OfficialReceiptCollectionEntryView, "Collection Details"],
        [OfficialReceiptAccountingEntryView, "Accounting Entries"],
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
    updates: Partial<OfficialReceiptLineEntry>,
  ) => void,
  columnOrder: OfficialReceiptCollectionColumnId[],
  visibleColumnIds: readonly OfficialReceiptCollectionColumnId[],
  columnLabels: Record<OfficialReceiptCollectionColumnId, string>,
  columnWidths: Record<OfficialReceiptCollectionColumnId, number>,
): ModuleDataEntryColumn<OfficialReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !OfficialReceiptCollectionProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderCollectionCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

function renderCollectionCell(
  row: OfficialReceiptLineEntry,
  columnId: OfficialReceiptCollectionColumnId,
  isReadonly: boolean,
  onUpdateEntry: (
    rowId: string,
    updates: Partial<OfficialReceiptLineEntry>,
  ) => void,
) {
  switch (columnId) {
    case "collectionType":
      return (
        <OfficialReceiptEntryDropdown
          options={OfficialReceiptCollectionTypeOptions}
          placeholder="Enter collection type"
          readOnly={isReadonly}
          value={row.collectionType}
          onChange={(collectionType) => onUpdateEntry(row.id, { collectionType })}
        />
      );
    case "grossReceipt":
      return (
        <OfficialReceiptEntryAmountInput
          value={row.grossReceipt}
          readOnly={isReadonly}
          onValueChange={(grossReceipt) => onUpdateEntry(row.id, { grossReceipt })}
        />
      );
    case "netOfVat":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptNetOfVat(row)} />;
    case "vatType":
      return (
        <OfficialReceiptEntryDropdown
          options={OfficialReceiptVatTypeOptions}
          placeholder="Select VAT type"
          readOnly={isReadonly}
          value={row.vatType}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "vatPercent":
      return (
        <OfficialReceiptEntryPercentInput
          value={row.vatPercent}
          readOnly={isReadonly}
          onValueChange={(vatPercent) => onUpdateEntry(row.id, { vatPercent })}
        />
      );
    case "vatAmount":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptVatAmount(row)} />;
    case "cwtCode":
      return (
        <OfficialReceiptEntryDropdown
          options={OfficialReceiptCwtCodeOptions}
          placeholder="Select CWT code"
          readOnly={isReadonly}
          value={row.cwtCode}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "cwtPercent":
      return (
        <OfficialReceiptEntryPercentInput
          value={row.cwtPercent}
          readOnly={isReadonly}
          onValueChange={(cwtPercent) => onUpdateEntry(row.id, { cwtPercent })}
        />
      );
    case "cwtAmount":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptCwtAmount(row)} />;
    case "totalReceived":
      return <OfficialReceiptEntryReadOnlyAmount value={calculateOfficialReceiptTotalReceived(row)} />;
    case "partyCode":
      return (
        <OfficialReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <OfficialReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <OfficialReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "responsibilityCenter":
      return (
        <OfficialReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <OfficialReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
  }
}

function createAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: (
    rowId: string,
    updates: Partial<OfficialReceiptLineEntry>,
  ) => void,
  columnOrder: OfficialReceiptAccountingColumnId[],
  visibleColumnIds: readonly OfficialReceiptAccountingColumnId[],
  columnLabels: Record<OfficialReceiptAccountingColumnId, string>,
  columnWidths: Record<OfficialReceiptAccountingColumnId, number>,
): ModuleDataEntryColumn<OfficialReceiptLineEntry>[] {
  return columnOrder
    .filter((columnId) => visibleColumnIds.includes(columnId))
    .map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !OfficialReceiptAccountingProtectedColumnIds.has(columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
      renderCell: (row) => renderAccountingCell(row, columnId, isReadonly, onUpdateEntry),
    }));
}

function renderAccountingCell(
  row: OfficialReceiptLineEntry,
  columnId: OfficialReceiptAccountingColumnId,
  isReadonly: boolean,
  onUpdateEntry: (
    rowId: string,
    updates: Partial<OfficialReceiptLineEntry>,
  ) => void,
) {
  switch (columnId) {
    case "accountCode":
      return (
        <OfficialReceiptEntryInput
          value={row.accountCode}
          readOnly={isReadonly}
          onChange={(accountCode) => onUpdateEntry(row.id, { accountCode })}
        />
      );
    case "accountTitle":
      return (
        <OfficialReceiptEntryInput
          value={row.accountTitle}
          readOnly={isReadonly}
          onChange={(accountTitle) => onUpdateEntry(row.id, { accountTitle })}
        />
      );
    case "partyCode":
      return (
        <OfficialReceiptEntryInput
          value={row.partyCode}
          readOnly={isReadonly}
          onChange={(partyCode) => onUpdateEntry(row.id, { partyCode })}
        />
      );
    case "partyName":
      return (
        <OfficialReceiptEntryInput
          value={row.partyName || row.customerName}
          readOnly={isReadonly}
          onChange={(partyName) => onUpdateEntry(row.id, { partyName, customerName: partyName })}
        />
      );
    case "particulars":
      return (
        <OfficialReceiptEntryInput
          value={row.particulars}
          readOnly={isReadonly}
          onChange={(particulars) => onUpdateEntry(row.id, { particulars })}
        />
      );
    case "vatType":
      return (
        <OfficialReceiptEntryInput
          value={row.vatType}
          readOnly={isReadonly}
          onChange={(vatType) => onUpdateEntry(row.id, { vatType })}
        />
      );
    case "cwtCode":
      return (
        <OfficialReceiptEntryInput
          value={row.cwtCode}
          readOnly={isReadonly}
          onChange={(cwtCode) => onUpdateEntry(row.id, { cwtCode })}
        />
      );
    case "responsibilityCenter":
      return (
        <OfficialReceiptEntryInput
          value={row.responsibilityCenter}
          readOnly={isReadonly}
          onChange={(responsibilityCenter) => onUpdateEntry(row.id, { responsibilityCenter })}
        />
      );
    case "referenceNo":
      return (
        <OfficialReceiptEntryInput
          value={row.referenceNo}
          readOnly={isReadonly}
          onChange={(referenceNo) => onUpdateEntry(row.id, { referenceNo })}
        />
      );
    case "debit":
      return <OfficialReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.debit)} />;
    case "credit":
      return <OfficialReceiptEntryReadOnlyAmount value={parseMoneyNumberInput(row.credit)} />;
  }
}

function shouldClearEntry(
  entry: OfficialReceiptLineEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return officialReceiptEntryHasData(entry);
  }

  if (action === "incomplete") {
    return officialReceiptEntryHasData(entry) && !officialReceiptEntryIsComplete(entry);
  }

  return !officialReceiptEntryHasData(entry);
}

function createAccountingRows(rows: OfficialReceiptLineEntry[]) {
  return rows.flatMap((row) => {
    const grossReceipt = parseMoneyNumberInput(row.grossReceipt);

    if (grossReceipt <= 0) {
      return [];
    }

    const netOfVat = calculateOfficialReceiptNetOfVat(row);
    const vatAmount = calculateOfficialReceiptVatAmount(row);
    const cwtAmount = calculateOfficialReceiptCwtAmount(row);
    const totalReceived = calculateOfficialReceiptTotalReceived(row);
    const commonFields = {
      bankName: row.bankName,
      checkDate: row.checkDate,
      checkNo: row.checkNo,
      collectionType: row.collectionType,
      customerName: row.partyName || row.customerName,
      cwtCode: row.cwtCode,
      cwtPercent: row.cwtPercent,
      grossReceipt: row.grossReceipt,
      particulars: row.particulars || row.collectionType,
      partyCode: row.partyCode,
      partyName: row.partyName || row.customerName,
      referenceNo: row.referenceNo,
      responsibilityCenter: row.responsibilityCenter,
      vat: formatOfficialReceiptAmount(vatAmount),
      vatExempt: row.vatExempt,
      vatPercent: row.vatPercent,
      vatType: row.vatType,
      ewt: formatOfficialReceiptAmount(cwtAmount),
    } satisfies Omit<
      OfficialReceiptLineEntry,
      "accountCode" | "accountTitle" | "credit" | "debit" | "id"
    >;

    return [
      {
        ...commonFields,
        id: `${row.id}-cash`,
        accountCode: "1010103001",
        accountTitle: "Cash in Bank",
        debit: totalReceived.toFixed(2),
        credit: "0.00",
      },
      ...(cwtAmount > 0
        ? [
            {
              ...commonFields,
              id: `${row.id}-cwt`,
              accountCode: "1010104008",
              accountTitle: "Creditable Withholding Tax",
              debit: cwtAmount.toFixed(2),
              credit: "0.00",
            },
          ]
        : []),
      ...(vatAmount > 0
        ? [
            {
              ...commonFields,
              id: `${row.id}-vat`,
              accountCode: "2010002005",
              accountTitle: "Output VAT",
              debit: "0.00",
              credit: vatAmount.toFixed(2),
            },
          ]
        : []),
      {
        ...commonFields,
        id: `${row.id}-revenue`,
        accountCode: "4020000001",
        accountTitle: row.collectionType || "Service Revenue",
        debit: "0.00",
        credit: netOfVat.toFixed(2),
      },
    ];
  });
}

function isOfficialReceiptCollectionColumnId(
  columnId: string,
): columnId is OfficialReceiptCollectionColumnId {
  return OfficialReceiptCollectionColumnIds.includes(
    columnId as OfficialReceiptCollectionColumnId,
  );
}

function isOfficialReceiptAccountingColumnId(
  columnId: string,
): columnId is OfficialReceiptAccountingColumnId {
  return OfficialReceiptAccountingColumnIds.includes(
    columnId as OfficialReceiptAccountingColumnId,
  );
}

function getCollectionExportCell(
  entry: OfficialReceiptLineEntry,
  columnId: OfficialReceiptCollectionColumnId,
) {
  switch (columnId) {
    case "netOfVat":
      return formatOfficialReceiptAmount(calculateOfficialReceiptNetOfVat(entry));
    case "vatAmount":
      return formatOfficialReceiptAmount(calculateOfficialReceiptVatAmount(entry));
    case "cwtAmount":
      return formatOfficialReceiptAmount(calculateOfficialReceiptCwtAmount(entry));
    case "totalReceived":
      return formatOfficialReceiptAmount(calculateOfficialReceiptTotalReceived(entry));
    default:
      return String(entry[columnId] ?? "");
  }
}

function getAccountingExportCell(
  entry: OfficialReceiptLineEntry,
  columnId: OfficialReceiptAccountingColumnId,
) {
  return String(entry[columnId] ?? "");
}

function calculateCollectionColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: OfficialReceiptCollectionColumnId;
  columnLabels: Record<OfficialReceiptCollectionColumnId, string>;
  rows: OfficialReceiptLineEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = rows.reduce(
    (currentWidth, row) =>
      Math.max(
        currentWidth,
        estimateTextWidth(getCollectionExportCell(row, columnId), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function calculateAccountingColumnFitWidth({
  columnId,
  columnLabels,
  rows,
}: {
  columnId: OfficialReceiptAccountingColumnId;
  columnLabels: Record<OfficialReceiptAccountingColumnId, string>;
  rows: OfficialReceiptLineEntry[];
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
