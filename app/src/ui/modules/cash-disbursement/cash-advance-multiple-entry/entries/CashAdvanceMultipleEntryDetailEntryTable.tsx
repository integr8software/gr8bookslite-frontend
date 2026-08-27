import { useMemo, useState } from "react";
import {
  CashAdvanceMultipleEntryDefaultItemColumnIds,
  CashAdvanceMultipleEntryItemColumnOrder,
  CashAdvanceMultipleEntryProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  calculateCashAdvanceMultipleEntryTotal,
  createBlankCashAdvanceMultipleEntryItem,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import {
  removeCashAdvanceMultipleEntryRow,
  replaceCashAdvanceMultipleEntryRow,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import type {
  CashAdvanceMultipleEntryDetailEntryTableProps,
  CashAdvanceMultipleEntryItem,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { createCashAdvanceMultipleEntryItemColumns } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryEntryColumns";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { reorderColumnIds, toggleVisibleColumnId } from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";

export function CashAdvanceMultipleEntryDetailEntryTable({
  employeeOptions,
  isReadonly,
  onAddRows,
  onOpenPartyDrawer,
  onOpenResponsibilityCenterDrawer,
  onRowsChange,
  rows,
}: CashAdvanceMultipleEntryDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<string[]>(CashAdvanceMultipleEntryItemColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(CashAdvanceMultipleEntryDefaultItemColumnIds);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const allColumns = useMemo(
    () =>
      createCashAdvanceMultipleEntryItemColumns({
        employeeOptions,
        isReadonly,
        onOpenItemPartyDrawer: onOpenPartyDrawer,
        onOpenItemResponsibilityCenterDrawer: onOpenResponsibilityCenterDrawer,
        onUpdateEntry: (rowId, updates) =>
          onRowsChange(replaceCashAdvanceMultipleEntryRow(rows, rowId, updates)),
        rows,
      }),
    [employeeOptions, isReadonly, onOpenPartyDrawer, onOpenResponsibilityCenterDrawer, onRowsChange, rows],
  );
  const columns = useMemo(
    () =>
      columnOrder
        .filter((columnId) => visibleColumnIds.includes(columnId))
        .map((columnId) => allColumns[columnId])
        .filter((column): column is ModuleDataEntryColumn<CashAdvanceMultipleEntryItem> => Boolean(column))
        .map((column) => (columnWidths[column.id] ? { ...column, width: columnWidths[column.id] } : column)),
    [allColumns, columnOrder, columnWidths, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !CashAdvanceMultipleEntryProtectedItemColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: allColumns[columnId].header,
        width: columnWidths[columnId] ?? allColumns[columnId].width,
        widthMode: allColumns[columnId].widthMode,
      })),
    [allColumns, columnOrder, columnWidths, visibleColumnIds],
  );
  const totalAmount = useMemo(() => calculateCashAdvanceMultipleEntryTotal(rows), [rows]);

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      columns={columns}
      columnOptions={columnOptions}
      emptyRowLabel="entry"
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatCashAdvanceMultipleEntryAmount(totalAmount)}
        </span>
      }
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{ amount: formatCashAdvanceMultipleEntryAmount(totalAmount) }}
      summaryRowHeader="Totals"
      title="Cash Advance Entries"
      onAddRows={onAddRows}
      onClearRow={(rowId) =>
        onRowsChange(
          rows.map((row) => (row.id === rowId ? { ...createBlankCashAdvanceMultipleEntryItem(), id: rowId } : row)),
        )
      }
      onClearRows={() => onRowsChange([createBlankCashAdvanceMultipleEntryItem()])}
      onDuplicateRow={(rowId) => {
        const row = rows.find((currentRow) => currentRow.id === rowId);
        if (row) onRowsChange([...rows, { ...row, id: `came-item-${Date.now()}` }]);
      }}
      onInsertRow={() => undefined}
      onMoveRow={() => undefined}
      onRemoveRow={(rowId) =>
        onRowsChange(
          rows.length > 1
            ? removeCashAdvanceMultipleEntryRow(rows, rowId)
            : [createBlankCashAdvanceMultipleEntryItem()],
        )
      }
      onResetColumns={() => {
        setColumnOrder(CashAdvanceMultipleEntryItemColumnOrder);
        setVisibleColumnIds(CashAdvanceMultipleEntryDefaultItemColumnIds);
        setColumnWidths({});
      }}
      onMoveColumn={(fromColumnId, toColumnId) =>
        setColumnOrder((current) => reorderColumnIds(current, fromColumnId, toColumnId))
      }
      onToggleColumnVisibility={(columnId, isVisible) => {
        if (!isVisible && CashAdvanceMultipleEntryProtectedItemColumnIds.has(columnId)) {
          return;
        }

        setVisibleColumnIds((current) => toggleVisibleColumnId(current, columnOrder, columnId, isVisible));
      }}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={(columnId, width) =>
        setColumnWidths((current) => ({ ...current, [columnId]: width }))
      }
    />
  );
}
