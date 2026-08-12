import { useMemo, useState } from "react";
import {
  CashAdvanceMultipleEntryDefaultAccountingColumnIds,
  CashAdvanceMultipleEntryDefaultItemColumnIds,
  CashAdvanceMultipleEntryEntryTabs,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  CashAdvanceMultipleEntryResponsibilityCenterOptions,
  calculateCashAdvanceMultipleEntryTotal,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import {
  removeCashAdvanceMultipleEntryRow,
  replaceCashAdvanceMultipleEntryRow,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import type {
  CashAdvanceMultipleEntryAccountingEntry,
  CashAdvanceMultipleEntryItem,
  CashAdvanceMultipleEntryTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  EntryAccountDropdown,
  EntryDropdown,
  EntryNumberInput,
  EntryPartyDropdown,
  EntryTextInput,
} from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryFieldControls";

export function CashAdvanceMultipleEntryEntrySection({
  accountingRows,
  isReadonly,
  onAccountingRowsChange,
  onAddAccountingRows,
  onAddRows,
  onOpenAccountingPartyDialog,
  onOpenAccountingResponsibilityCenterDrawer,
  onOpenItemResponsibilityCenterDrawer,
  onOpenItemPartyDialog,
  responsibilityCenterOptions,
  onRowsChange,
  rows,
}: {
  accountingRows: CashAdvanceMultipleEntryAccountingEntry[];
  isReadonly: boolean;
  rows: CashAdvanceMultipleEntryItem[];
  onAccountingRowsChange: (rows: CashAdvanceMultipleEntryAccountingEntry[]) => void;
  onAddAccountingRows: (count: number) => void;
  onAddRows: (count: number) => void;
  onOpenAccountingPartyDialog: (rowId: string) => void;
  onOpenAccountingResponsibilityCenterDrawer: (rowId: string) => void;
  onOpenItemResponsibilityCenterDrawer: (rowId: string) => void;
  onOpenItemPartyDialog: (rowId: string) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  onRowsChange: (rows: CashAdvanceMultipleEntryItem[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<CashAdvanceMultipleEntryTab>("items");
  const [visibleItemColumnIds, setVisibleItemColumnIds] = useState<string[]>(
    CashAdvanceMultipleEntryDefaultItemColumnIds,
  );
  const [itemColumnWidths, setItemColumnWidths] = useState<Record<string, number>>({});
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<string[]>(
    CashAdvanceMultipleEntryDefaultAccountingColumnIds,
  );
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<Record<string, number>>({});
  const totalAmount = useMemo(() => calculateCashAdvanceMultipleEntryTotal(rows), [rows]);
  const itemColumns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[]>(
    () =>
      createItemColumns(
        isReadonly,
        (rowId, updates) => onRowsChange(replaceCashAdvanceMultipleEntryRow(rows, rowId, updates)),
        onOpenItemPartyDialog,
        onOpenItemResponsibilityCenterDrawer,
      ),
    [isReadonly, onOpenItemPartyDialog, onOpenItemResponsibilityCenterDrawer, onRowsChange, rows],
  );
  const accountingColumns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[]>(
    () =>
      createAccountingColumns(
        isReadonly,
        (rowId, updates) =>
          onAccountingRowsChange(replaceCashAdvanceMultipleEntryRow(accountingRows, rowId, updates)),
        onOpenAccountingPartyDialog,
        onOpenAccountingResponsibilityCenterDrawer,
        responsibilityCenterOptions,
      ),
    [
      accountingRows,
      isReadonly,
      onAccountingRowsChange,
      onOpenAccountingPartyDialog,
      onOpenAccountingResponsibilityCenterDrawer,
      responsibilityCenterOptions,
    ],
  );
  const visibleItemColumns = useMemo(
    () =>
      createVisibleColumns(itemColumns, visibleItemColumnIds).map((column) =>
        applyColumnWidth(column, itemColumnWidths),
      ),
    [itemColumnWidths, itemColumns, visibleItemColumnIds],
  );
  const visibleAccountingColumns = useMemo(
    () =>
      createVisibleColumns(accountingColumns, visibleAccountingColumnIds).map((column) =>
        applyColumnWidth(column, accountingColumnWidths),
      ),
    [accountingColumnWidths, accountingColumns, visibleAccountingColumnIds],
  );

  if (activeTab === "accounting") {
    return (
      <ModuleDataEntry
        columns={visibleAccountingColumns}
        columnOptions={createColumnOptions(
          accountingColumns,
          visibleAccountingColumnIds,
          CashAdvanceMultipleEntryDefaultAccountingColumnIds,
        )}
        description=""
        emptyRowLabel="accounting entry"
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">
            Total Amount: {formatCashAdvanceMultipleEntryAmount(totalAmount)}
          </span>
        }
        isReadonly={isReadonly}
        rows={accountingRows}
        title={<CashAdvanceMultipleEntryEntryTabsView activeTab={activeTab} onTabChange={setActiveTab} />}
        onAddRows={onAddAccountingRows}
        onClearRows={() => onAccountingRowsChange(accountingRows.slice(0, 1))}
        onDuplicateRow={(rowId) => {
          const row = accountingRows.find((currentRow) => currentRow.id === rowId);

          if (row) {
            onAccountingRowsChange([...accountingRows, { ...row, id: `came-accounting-${Date.now()}` }]);
          }
        }}
        onInsertRow={() => undefined}
        onMoveRow={() => undefined}
        onRemoveRow={(rowId) => onAccountingRowsChange(removeCashAdvanceMultipleEntryRow(accountingRows, rowId))}
        onResetColumns={() => setVisibleAccountingColumnIds(CashAdvanceMultipleEntryDefaultAccountingColumnIds)}
        onMoveColumn={(fromColumnId, toColumnId) =>
          setVisibleAccountingColumnIds((current) => moveColumnId(current, fromColumnId, toColumnId))
        }
        onToggleColumnVisibility={(columnId, isVisible) =>
          setVisibleAccountingColumnIds((current) =>
            updateVisibleColumnIds(
              current,
              accountingColumns,
              columnId,
              isVisible,
              CashAdvanceMultipleEntryDefaultAccountingColumnIds,
            ),
          )
        }
        onUpdateColumnHeader={() => undefined}
        onUpdateColumnWidth={(columnId, width) =>
          setAccountingColumnWidths((current) => ({ ...current, [columnId]: width }))
        }
      />
    );
  }

  return (
    <ModuleDataEntry
      columns={visibleItemColumns}
      columnOptions={createColumnOptions(
        itemColumns,
        visibleItemColumnIds,
        CashAdvanceMultipleEntryDefaultItemColumnIds,
      )}
      description=""
      emptyRowLabel="item"
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatCashAdvanceMultipleEntryAmount(totalAmount)}
        </span>
      }
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{ amount: formatCashAdvanceMultipleEntryAmount(totalAmount) }}
      summaryRowHeader="Totals"
      title={<CashAdvanceMultipleEntryEntryTabsView activeTab={activeTab} onTabChange={setActiveTab} />}
      onAddRows={onAddRows}
      onClearRows={() => onRowsChange(rows.slice(0, 1))}
      onDuplicateRow={(rowId) => {
        const row = rows.find((currentRow) => currentRow.id === rowId);

        if (row) {
          onRowsChange([...rows, { ...row, id: `came-item-${Date.now()}` }]);
        }
      }}
      onInsertRow={() => undefined}
      onMoveRow={() => undefined}
      onRemoveRow={(rowId) => onRowsChange(removeCashAdvanceMultipleEntryRow(rows, rowId))}
      onResetColumns={() => setVisibleItemColumnIds(CashAdvanceMultipleEntryDefaultItemColumnIds)}
      onMoveColumn={(fromColumnId, toColumnId) =>
        setVisibleItemColumnIds((current) => moveColumnId(current, fromColumnId, toColumnId))
      }
      onToggleColumnVisibility={(columnId, isVisible) =>
        setVisibleItemColumnIds((current) =>
          updateVisibleColumnIds(
            current,
            itemColumns,
            columnId,
            isVisible,
            CashAdvanceMultipleEntryDefaultItemColumnIds,
          ),
        )
      }
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={(columnId, width) =>
        setItemColumnWidths((current) => ({ ...current, [columnId]: width }))
      }
    />
  );
}

function CashAdvanceMultipleEntryEntryTabsView({
  activeTab,
  onTabChange,
}: {
  activeTab: CashAdvanceMultipleEntryTab;
  onTabChange: (tab: CashAdvanceMultipleEntryTab) => void;
}) {
  return (
    <div role="tablist" aria-label="Cash advances multiple entry lines" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
      {CashAdvanceMultipleEntryEntryTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
            activeTab === tab.id
              ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
              : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function createItemColumns(
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceMultipleEntryItem>) => void,
  onOpenItemPartyDialog: (rowId: string) => void,
  onOpenResponsibilityCenterDrawer: (rowId: string) => void,
): ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[] {
  return [
    {
      header: "Party Code",
      id: "partyCode",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput
          id={context.fieldId}
          name={context.fieldName}
          onChange={() => undefined}
          readOnly
          value={row.partyCode}
        />
      ),
    },
    {
      header: "Party Name",
      id: "partyName",
      width: 260,
      widthClassName: "w-[16rem]",
      renderCell: (row, _index, context) => (
        <EntryPartyDropdown
          id={context.fieldId}
          name={context.fieldName}
          optionDisplay="name"
          readOnly={isReadonly}
          value={row.partyCode}
          onAddParty={() => onOpenItemPartyDialog(row.id)}
          onChange={(partyCode, partyName) => onUpdateEntry(row.id, { partyCode, partyName })}
        />
      ),
    },
    {
      header: "Amount",
      id: "amount",
      width: 160,
      widthClassName: "w-[10rem]",
      renderCell: (row, _index, context) => (
        <EntryNumberInput
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.amount}
          onChange={(value) => onUpdateEntry(row.id, { amount: value })}
        />
      ),
    },
    {
      header: "Responsibility Center Code",
      id: "responsibilityCenterCode",
      width: 180,
      widthClassName: "w-[11.25rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput
          id={context.fieldId}
          name={context.fieldName}
          onChange={() => undefined}
          readOnly
          value={getResponsibilityCenterCode(row.responsibilityCenter)}
        />
      ),
    },
    {
      header: "Responsibility Center",
      id: "responsibilityCenter",
      width: 190,
      widthClassName: "w-[12rem]",
      renderCell: (row, _index, context) => (
        <EntryDropdown
          id={context.fieldId}
          name={context.fieldName}
          addActionLabel="Add Responsibility Center"
          onAddAction={() => onOpenResponsibilityCenterDrawer(row.id)}
          options={CashAdvanceMultipleEntryResponsibilityCenterOptions}
          readOnly={isReadonly}
          value={row.responsibilityCenter}
          onChange={(value) => onUpdateEntry(row.id, { responsibilityCenter: value })}
        />
      ),
    },
    textColumn("Remarks", "particulars", 300, isReadonly, onUpdateEntry),
  ];
}

function createAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceMultipleEntryAccountingEntry>) => void,
  onOpenAccountingPartyDialog: (rowId: string) => void,
  onOpenAccountingResponsibilityCenterDrawer: (rowId: string) => void,
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
): ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[] {
  return [
    {
      header: "Account Code",
      id: "accountCode",
      width: 160,
      widthClassName: "w-[10rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput
          id={context.fieldId}
          name={context.fieldName}
          onChange={() => undefined}
          readOnly
          value={row.accountCode}
        />
      ),
    },
    {
      header: "Account Title",
      id: "accountTitle",
      width: 260,
      widthClassName: "w-[16.25rem]",
      renderCell: (row, _index, context) => (
        <EntryAccountDropdown
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.accountCode}
          onChange={(accountCode, accountTitle) => onUpdateEntry(row.id, { accountCode, accountTitle })}
        />
      ),
    },
    numberColumn("Credit", "credit", 140, isReadonly, onUpdateEntry),
    numberColumn("Debit", "debit", 140, isReadonly, onUpdateEntry),
    {
      header: "Party Code",
      id: "partyCode",
      width: 150,
      widthClassName: "w-[9.375rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput
          id={context.fieldId}
          name={context.fieldName}
          onChange={() => undefined}
          readOnly
          value={row.partyCode}
        />
      ),
    },
    {
      header: "Party Name",
      id: "partyName",
      width: 240,
      widthClassName: "w-[15rem]",
      renderCell: (row, _index, context) => (
        <EntryPartyDropdown
          id={context.fieldId}
          name={context.fieldName}
          optionDisplay="name"
          readOnly={isReadonly}
          value={row.partyCode}
          onAddParty={() => onOpenAccountingPartyDialog(row.id)}
          onChange={(partyCode, partyName) => onUpdateEntry(row.id, { partyCode, partyName })}
        />
      ),
    },
    {
      header: "Responsibility Center Code",
      id: "responsibilityCenterCode",
      width: 180,
      widthClassName: "w-[11.25rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput
          id={context.fieldId}
          name={context.fieldName}
          onChange={() => undefined}
          readOnly
          value={getResponsibilityCenterCode(row.responsibilityCenter)}
        />
      ),
    },
    {
      header: "Responsibility Center",
      id: "responsibilityCenter",
      width: 210,
      widthClassName: "w-[13.125rem]",
      renderCell: (row, _index, context) => (
        <EntryDropdown
          id={context.fieldId}
          name={context.fieldName}
          addActionLabel="Add Responsibility Center"
          onAddAction={() => onOpenAccountingResponsibilityCenterDrawer(row.id)}
          options={responsibilityCenterOptions}
          readOnly={isReadonly}
          value={row.responsibilityCenter}
          onChange={(value) => onUpdateEntry(row.id, { responsibilityCenter: value })}
        />
      ),
    },
    textColumn("Remarks", "particulars", 260, isReadonly, onUpdateEntry),
  ];
}

function getResponsibilityCenterCode(responsibilityCenter: string) {
  return (
    CashAdvanceMultipleEntryResponsibilityCenterOptions.find(
      (option) => option.name === responsibilityCenter || option.value === responsibilityCenter,
    )?.value ?? responsibilityCenter
  );
}

function textColumn<TRow extends { id: string }>(
  header: string,
  id: keyof TRow & string,
  width: number,
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<TRow>) => void,
): ModuleDataEntryColumn<TRow> {
  return {
    header,
    id,
    width,
    widthClassName: `w-[${width / 16}rem]`,
    renderCell: (row, _index, context) => (
      <EntryTextInput
        id={context.fieldId}
        name={context.fieldName}
        readOnly={isReadonly}
        value={String(row[id] ?? "")}
        onChange={(value) => onUpdateEntry(row.id, { [id]: value } as Partial<TRow>)}
      />
    ),
  };
}

function numberColumn<TRow extends { id: string }>(
  header: string,
  id: keyof TRow & string,
  width: number,
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<TRow>) => void,
): ModuleDataEntryColumn<TRow> {
  return {
    ...textColumn(header, id, width, isReadonly, onUpdateEntry),
    renderCell: (row, _index, context) => (
      <EntryNumberInput
        id={context.fieldId}
        name={context.fieldName}
        readOnly={isReadonly}
        value={String(row[id] ?? "")}
        onChange={(value) => onUpdateEntry(row.id, { [id]: value } as Partial<TRow>)}
      />
    ),
  };
}

function createColumnOptions<TRow extends { id: string }>(
  columns: ModuleDataEntryColumn<TRow>[],
  visibleColumnIds: string[],
  defaultColumnIds: string[],
): ModuleDataEntryColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    isHideable: !defaultColumnIds.includes(column.id),
    isVisible: visibleColumnIds.includes(column.id),
    label: column.header,
    width: column.width,
    widthMode: column.widthMode,
  }));
}

function createVisibleColumns<TRow extends { id: string }>(
  columns: ModuleDataEntryColumn<TRow>[],
  visibleColumnIds: string[],
): ModuleDataEntryColumn<TRow>[] {
  const columnsById = new Map(columns.map((column) => [column.id, column]));

  return visibleColumnIds
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is ModuleDataEntryColumn<TRow> => Boolean(column));
}

function applyColumnWidth<TRow>(
  column: ModuleDataEntryColumn<TRow>,
  widths: Record<string, number>,
): ModuleDataEntryColumn<TRow> {
  return widths[column.id] ? { ...column, width: widths[column.id] } : column;
}

function moveColumnId(
  currentColumnIds: string[],
  fromColumnId: string,
  toColumnId: string,
) {
  if (fromColumnId === toColumnId) {
    return currentColumnIds;
  }

  const fromIndex = currentColumnIds.indexOf(fromColumnId);
  const toIndex = currentColumnIds.indexOf(toColumnId);

  if (fromIndex < 0 || toIndex < 0) {
    return currentColumnIds;
  }

  const nextColumnIds = [...currentColumnIds];
  const [movedColumnId] = nextColumnIds.splice(fromIndex, 1);

  nextColumnIds.splice(toIndex, 0, movedColumnId);

  return nextColumnIds;
}

function updateVisibleColumnIds<TRow extends { id: string }>(
  currentVisibleIds: string[],
  columns: ModuleDataEntryColumn<TRow>[],
  columnId: string,
  isVisible: boolean,
  defaultColumnIds: string[],
) {
  const column = columns.find((currentColumn) => currentColumn.id === columnId);

  if (!column) {
    return currentVisibleIds;
  }

  if (isVisible) {
    return currentVisibleIds.includes(columnId)
      ? currentVisibleIds
      : columns
          .map((currentColumn) => currentColumn.id)
          .filter((currentColumnId) => currentColumnId === columnId || currentVisibleIds.includes(currentColumnId));
  }

  if (defaultColumnIds.includes(columnId)) {
    return currentVisibleIds;
  }

  return currentVisibleIds.filter((currentColumnId) => currentColumnId !== columnId);
}
