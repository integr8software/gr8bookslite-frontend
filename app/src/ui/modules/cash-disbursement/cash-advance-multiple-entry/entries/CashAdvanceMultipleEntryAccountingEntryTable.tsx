import { useMemo, useState } from "react";
import { CashAdvanceMultipleEntryDefaultAccountingColumnIds } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  createBlankCashAdvanceMultipleEntryAccountingEntry,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { removeCashAdvanceMultipleEntryRow } from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import type {
  CashAdvanceMultipleEntryAccountingEntry,
  CashAdvanceMultipleEntryAccountingEntryTableProps,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { createCashAdvanceMultipleEntryAccountingColumns } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryEntryColumns";
import { TabbedModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";
import type {
  ModuleDataEntryColumn,
  ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { reorderColumnIds, toggleVisibleColumnId } from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";

export function CashAdvanceMultipleEntryAccountingEntryTable({
  employeeOptions,
  isReadonly,
  onAddRows,
  onOpenPartyDrawer,
  onOpenResponsibilityCenterDrawer,
  onRowsChange,
  responsibilityCenterOptions,
  rows,
}: CashAdvanceMultipleEntryAccountingEntryTableProps) {
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    CashAdvanceMultipleEntryDefaultAccountingColumnIds,
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>({});
  const allColumns = useMemo(
    () =>
      createCashAdvanceMultipleEntryAccountingColumns({
        employeeOptions,
        isReadonly,
        onOpenAccountingPartyDrawer: onOpenPartyDrawer,
        onOpenAccountingResponsibilityCenterDrawer: onOpenResponsibilityCenterDrawer,
        onUpdateEntry: (rowId, updates) =>
          onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row))),
        responsibilityCenterOptions,
      }),
    [employeeOptions, isReadonly, onOpenPartyDrawer, onOpenResponsibilityCenterDrawer, onRowsChange, responsibilityCenterOptions, rows],
  );
  const columnOrder = Object.keys(allColumns);
  const columns = useMemo(
    () =>
      visibleColumnIds
        .map((columnId) => allColumns[columnId])
        .filter((column): column is ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry> => Boolean(column))
        .map((column) => ({
          ...column,
          header: columnLabels[column.id] ?? column.header,
          width: columnWidths[column.id] ?? column.width,
        })),
    [allColumns, columnLabels, columnWidths, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !CashAdvanceMultipleEntryDefaultAccountingColumnIds.includes(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: columnLabels[columnId] ?? allColumns[columnId].header,
        width: columnWidths[columnId] ?? allColumns[columnId].width,
        widthMode: allColumns[columnId].widthMode,
      })),
    [allColumns, columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );
  const totals = useMemo(
    () =>
      rows.reduce(
        (current, row) => ({
          credit: current.credit + parseMoneyNumberInput(row.credit),
          debit: current.debit + parseMoneyNumberInput(row.debit),
        }),
        { credit: 0, debit: 0 },
      ),
    [rows],
  );
  const variance = Math.abs(totals.debit - totals.credit);

  return (
    <TabbedModuleDataEntry
      addButtonLabel="Add Entry"
      columns={columns}
      columnOptions={columnOptions}
      canConfigureColumnsWhenReadonly
      canManageRowsWhenReadonly={!isReadonly}
      emptyRowLabel="entry"
      footerDetails={
        <span className={`text-sm font-semibold ${variance < 0.001 ? "text-emerald-700" : "text-coralpink"}`}>
          Variance: {formatCashAdvanceMultipleEntryAmount(variance)}
        </span>
      }
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{
        credit: formatCashAdvanceMultipleEntryAmount(totals.credit),
        debit: formatCashAdvanceMultipleEntryAmount(totals.debit),
      }}
      summaryRowHeader="Totals"
      title="Accounting Entries"
      onAddRows={onAddRows}
      onClearRow={(rowId) =>
        onRowsChange(
          rows.map((row) =>
            row.id === rowId ? { ...createBlankCashAdvanceMultipleEntryAccountingEntry(), id: rowId } : row,
          ),
        )
      }
      onClearRows={() => onRowsChange([createBlankCashAdvanceMultipleEntryAccountingEntry()])}
      onDuplicateRow={(rowId) => {
        const row = rows.find((currentRow) => currentRow.id === rowId);
        if (row) onRowsChange([...rows, { ...row, id: `came-accounting-${Date.now()}` }]);
      }}
      onInsertRow={() => undefined}
      onMoveRow={() => undefined}
      onRemoveRow={(rowId) =>
        onRowsChange(
          rows.length > 1
            ? removeCashAdvanceMultipleEntryRow(rows, rowId)
            : [createBlankCashAdvanceMultipleEntryAccountingEntry()],
        )
      }
      onResetColumns={() => {
        setVisibleColumnIds(CashAdvanceMultipleEntryDefaultAccountingColumnIds);
        setColumnWidths({});
        setColumnLabels({});
      }}
      onMoveColumn={(fromColumnId, toColumnId) =>
        setVisibleColumnIds((current) => reorderColumnIds(current, fromColumnId, toColumnId))
      }
      onToggleColumnVisibility={(columnId, isVisible) =>
        setVisibleColumnIds((current) => toggleVisibleColumnId(current, columnOrder, columnId, isVisible))
      }
      onUpdateColumnHeader={(columnId, header) =>
        setColumnLabels((current) => ({ ...current, [columnId]: header }))
      }
      onUpdateColumnWidth={(columnId, width) =>
        setColumnWidths((current) => ({ ...current, [columnId]: width }))
      }
    />
  );
}
