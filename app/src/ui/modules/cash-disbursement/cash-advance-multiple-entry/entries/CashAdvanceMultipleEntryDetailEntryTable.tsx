import { useMemo, useState } from "react";
import { CashAdvanceMultipleEntryDefaultItemColumnIds } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  calculateCashAdvanceMultipleEntryTotal,
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
  description,
  employeeOptions,
  isReadonly,
  onAddRows,
  onOpenPartyDrawer,
  onOpenResponsibilityCenterDrawer,
  onRowsChange,
  rows,
}: CashAdvanceMultipleEntryDetailEntryTableProps) {
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
  const columnOrder = Object.keys(allColumns);
  const columns = useMemo(
    () =>
      visibleColumnIds
        .map((columnId) => allColumns[columnId])
        .filter((column): column is ModuleDataEntryColumn<CashAdvanceMultipleEntryItem> => Boolean(column))
        .map((column) => (columnWidths[column.id] ? { ...column, width: columnWidths[column.id] } : column)),
    [allColumns, columnWidths, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !CashAdvanceMultipleEntryDefaultItemColumnIds.includes(columnId),
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
      columns={columns}
      columnOptions={columnOptions}
      description={description}
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
      title="Line Entries"
      onAddRows={onAddRows}
      onClearRows={() => onRowsChange(rows.slice(0, 1))}
      onDuplicateRow={(rowId) => {
        const row = rows.find((currentRow) => currentRow.id === rowId);
        if (row) onRowsChange([...rows, { ...row, id: `came-item-${Date.now()}` }]);
      }}
      onInsertRow={() => undefined}
      onMoveRow={() => undefined}
      onRemoveRow={(rowId) => onRowsChange(removeCashAdvanceMultipleEntryRow(rows, rowId))}
      onResetColumns={() => {
        setVisibleColumnIds(CashAdvanceMultipleEntryDefaultItemColumnIds);
        setColumnWidths({});
      }}
      onMoveColumn={(fromColumnId, toColumnId) =>
        setVisibleColumnIds((current) => reorderColumnIds(current, fromColumnId, toColumnId))
      }
      onToggleColumnVisibility={(columnId, isVisible) =>
        setVisibleColumnIds((current) => toggleVisibleColumnId(current, columnOrder, columnId, isVisible))
      }
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={(columnId, width) =>
        setColumnWidths((current) => ({ ...current, [columnId]: width }))
      }
    />
  );
}
