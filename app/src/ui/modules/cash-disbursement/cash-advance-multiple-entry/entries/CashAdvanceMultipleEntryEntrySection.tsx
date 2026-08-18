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
import type { CashAdvanceEmployeeOption } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { useCashAdvanceEmployeeOptions } from "@/app/src/hooks/modules/party-management/useCashAdvanceEmployeeOptions";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  EntryAccountDropdown,
  EntryDropdown,
  EntryMoneyNumberInput,
  EntryNumberInput,
  EntryPartyDropdown,
  EntryTextInput,
} from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryFieldControls";
import {
  getCashAdvanceMultipleEntryResponsibilityCenterCode,
  moveCashAdvanceMultipleEntryColumnId,
  updateCashAdvanceMultipleEntryVisibleColumnIds,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryEntryRowData";

export function CashAdvanceMultipleEntryEntrySection({
  accountingRows,
  isReadonly,
  onAccountingRowsChange,
  onAddAccountingRows,
  onAddRows,
  onOpenAccountingPartyDrawer,
  onOpenAccountingResponsibilityCenterDrawer,
  onOpenItemResponsibilityCenterDrawer,
  onOpenItemPartyDrawer,
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
  onOpenAccountingPartyDrawer: (rowId: string) => void;
  onOpenAccountingResponsibilityCenterDrawer: (rowId: string) => void;
  onOpenItemResponsibilityCenterDrawer: (rowId: string) => void;
  onOpenItemPartyDrawer: (rowId: string) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  onRowsChange: (rows: CashAdvanceMultipleEntryItem[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<CashAdvanceMultipleEntryTab>("items");
  const { employeeOptions, isEmployeeOptionsEmpty, isEmployeeOptionsError, isEmployeeOptionsLoading } =
    useCashAdvanceEmployeeOptions("cash-advance-multiple-entry");
  const [visibleItemColumnIds, setVisibleItemColumnIds] = useState<string[]>(CashAdvanceMultipleEntryDefaultItemColumnIds);
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
        rows,
        (rowId, updates) => onRowsChange(replaceCashAdvanceMultipleEntryRow(rows, rowId, updates)),
        onOpenItemPartyDrawer,
        onOpenItemResponsibilityCenterDrawer,
        employeeOptions,
      ),
    [employeeOptions, isReadonly, onOpenItemPartyDrawer, onOpenItemResponsibilityCenterDrawer, onRowsChange, rows],
  );
  const accountingColumns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[]>(
    () =>
      createAccountingColumns(
        isReadonly,
        (rowId, updates) => onAccountingRowsChange(replaceCashAdvanceMultipleEntryRow(accountingRows, rowId, updates)),
        onOpenAccountingPartyDrawer,
        onOpenAccountingResponsibilityCenterDrawer,
        responsibilityCenterOptions,
        employeeOptions,
      ),
    [
      accountingRows,
      isReadonly,
      onAccountingRowsChange,
      onOpenAccountingPartyDrawer,
      onOpenAccountingResponsibilityCenterDrawer,
      responsibilityCenterOptions,
      employeeOptions,
    ],
  );
  const visibleItemColumns = useMemo(
    () => createVisibleColumns(itemColumns, visibleItemColumnIds).map((column) => applyColumnWidth(column, itemColumnWidths)),
    [itemColumnWidths, itemColumns, visibleItemColumnIds],
  );
  const visibleAccountingColumns = useMemo(
    () =>
      createVisibleColumns(accountingColumns, visibleAccountingColumnIds).map((column) => applyColumnWidth(column, accountingColumnWidths)),
    [accountingColumnWidths, accountingColumns, visibleAccountingColumnIds],
  );
  const employeeOptionsState = isEmployeeOptionsLoading
    ? "Loading employee lookup options…"
    : isEmployeeOptionsError
      ? "Employee lookup options could not be loaded."
      : isEmployeeOptionsEmpty
        ? "No employee lookup options are available."
        : "";

  if (activeTab === "accounting") {
    return (
      <ModuleDataEntry
        columns={visibleAccountingColumns}
        columnOptions={createColumnOptions(
          accountingColumns,
          visibleAccountingColumnIds,
          CashAdvanceMultipleEntryDefaultAccountingColumnIds,
        )}
        description={employeeOptionsState}
        emptyRowLabel="accounting entry"
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">Total Amount: {formatCashAdvanceMultipleEntryAmount(totalAmount)}</span>
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
          setVisibleAccountingColumnIds((current) => moveCashAdvanceMultipleEntryColumnId(current, fromColumnId, toColumnId))
        }
        onToggleColumnVisibility={(columnId, isVisible) =>
          setVisibleAccountingColumnIds((current) =>
            updateCashAdvanceMultipleEntryVisibleColumnIds(
              current,
              accountingColumns,
              columnId,
              isVisible,
              CashAdvanceMultipleEntryDefaultAccountingColumnIds,
            ),
          )
        }
        onUpdateColumnHeader={() => undefined}
        onUpdateColumnWidth={(columnId, width) => setAccountingColumnWidths((current) => ({ ...current, [columnId]: width }))}
      />
    );
  }

  return (
    <ModuleDataEntry
      columns={visibleItemColumns}
      columnOptions={createColumnOptions(itemColumns, visibleItemColumnIds, CashAdvanceMultipleEntryDefaultItemColumnIds)}
      description={employeeOptionsState}
      emptyRowLabel="item"
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">Total Amount: {formatCashAdvanceMultipleEntryAmount(totalAmount)}</span>
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
        setVisibleItemColumnIds((current) => moveCashAdvanceMultipleEntryColumnId(current, fromColumnId, toColumnId))
      }
      onToggleColumnVisibility={(columnId, isVisible) =>
        setVisibleItemColumnIds((current) =>
          updateCashAdvanceMultipleEntryVisibleColumnIds(
            current,
            itemColumns,
            columnId,
            isVisible,
            CashAdvanceMultipleEntryDefaultItemColumnIds,
          ),
        )
      }
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={(columnId, width) => setItemColumnWidths((current) => ({ ...current, [columnId]: width }))}
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
    <div
      role="tablist"
      aria-label="Cash advance multiple entry lines"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
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
  rows: CashAdvanceMultipleEntryItem[],
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceMultipleEntryItem>) => void,
  onOpenItemPartyDrawer: (rowId: string) => void,
  onOpenResponsibilityCenterDrawer: (rowId: string) => void,
  employeeOptions: CashAdvanceEmployeeOption[],
): ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[] {
  return [
    {
      header: "Party Code",
      id: "partyCode",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput id={context.fieldId} name={context.fieldName} onChange={() => undefined} readOnly value={row.partyCode} />
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
          options={employeeOptions}
          value={row.partyCode}
          onAddParty={() => onOpenItemPartyDrawer(row.id)}
          onChange={(partyCode, partyName, cashAdvanceBalance) => {
            const amount = limitCashAdvanceMultipleEntryAmount(rows, row.id, row.amount, {
              cashAdvanceBalance,
              partyCode,
              partyName,
            });

            onUpdateEntry(row.id, { amount, cashAdvanceBalance, partyCode, partyName });
          }}
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
          onChange={(value) =>
            onUpdateEntry(row.id, {
              amount: limitCashAdvanceMultipleEntryAmount(rows, row.id, value),
            })
          }
        />
      ),
    },
    {
      header: "Cash Advance Balance",
      id: "cashAdvanceBalance",
      width: 180,
      widthClassName: "w-[11.25rem]",
      renderCell: (row, _index, context) => (
        <EntryMoneyNumberInput id={context.fieldId} name={context.fieldName} readOnly value={row.cashAdvanceBalance} />
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
          value={getCashAdvanceMultipleEntryResponsibilityCenterCode(row.responsibilityCenter)}
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

function limitCashAdvanceMultipleEntryAmount(
  rows: CashAdvanceMultipleEntryItem[],
  rowId: string,
  amount: string,
  partyOverrides?: Pick<CashAdvanceMultipleEntryItem, "cashAdvanceBalance" | "partyCode" | "partyName">,
) {
  const currentRow = rows.find((row) => row.id === rowId);

  if (!currentRow) {
    return amount;
  }

  const row = { ...currentRow, ...partyOverrides };

  if (!row.cashAdvanceBalance.trim()) {
    return amount;
  }

  const partyKey = row.partyCode.trim() || row.partyName.trim() || row.id;
  const usedBalance = rows.reduce((total, otherRow) => {
    const otherPartyKey = otherRow.partyCode.trim() || otherRow.partyName.trim() || otherRow.id;

    return otherRow.id !== rowId && otherPartyKey === partyKey ? total + parseMoneyNumberInput(otherRow.amount) : total;
  }, 0);
  const availableBalance = Math.max(0, parseMoneyNumberInput(row.cashAdvanceBalance) - usedBalance);

  return parseMoneyNumberInput(amount) > availableBalance ? formatCashAdvanceMultipleEntryAmount(availableBalance) : amount;
}

function createAccountingColumns(
  isReadonly: boolean,
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceMultipleEntryAccountingEntry>) => void,
  onOpenAccountingPartyDrawer: (rowId: string) => void,
  onOpenAccountingResponsibilityCenterDrawer: (rowId: string) => void,
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  employeeOptions: CashAdvanceEmployeeOption[],
): ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>[] {
  return [
    {
      header: "Account Code",
      id: "accountCode",
      width: 160,
      widthClassName: "w-[10rem]",
      renderCell: (row, _index, context) => (
        <EntryTextInput id={context.fieldId} name={context.fieldName} onChange={() => undefined} readOnly value={row.accountCode} />
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
        <EntryTextInput id={context.fieldId} name={context.fieldName} onChange={() => undefined} readOnly value={row.partyCode} />
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
          options={employeeOptions}
          readOnly={isReadonly}
          value={row.partyCode}
          onAddParty={() => onOpenAccountingPartyDrawer(row.id)}
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
          value={getCashAdvanceMultipleEntryResponsibilityCenterCode(row.responsibilityCenter)}
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

function applyColumnWidth<TRow>(column: ModuleDataEntryColumn<TRow>, widths: Record<string, number>): ModuleDataEntryColumn<TRow> {
  return widths[column.id] ? { ...column, width: widths[column.id] } : column;
}
