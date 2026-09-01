import { useMemo } from "react";
import {
  CashAdvanceMultipleEntryDetailTablePreferencesStorageKey,
  CashAdvanceMultipleEntryDefaultItemColumnIds,
  CashAdvanceMultipleEntryItemColumnLabels,
  CashAdvanceMultipleEntryItemColumnOrder,
  CashAdvanceMultipleEntryItemColumnWidths,
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
import { useDataEntryTablePreferences } from "@/app/src/hooks/shared/module/useDataEntryTablePreferences";
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

export function CashAdvanceMultipleEntryDetailEntryTable({
  employeeOptions,
  isReadonly,
  onAddRows,
  onOpenPartyDrawer,
  onOpenResponsibilityCenterDrawer,
  onRowsChange,
  responsibilityCenterOptions,
  rows,
}: CashAdvanceMultipleEntryDetailEntryTableProps) {
  const {
    columnOrder,
    visibleColumnIds,
    columnWidths,
    columnLabels,
    handleMoveColumn,
    handleToggleColumnVisibility,
    handleUpdateColumnHeader,
    handleUpdateColumnWidth,
    handleResetColumns,
  } = useDataEntryTablePreferences<string>({
    storageKey: CashAdvanceMultipleEntryDetailTablePreferencesStorageKey,
    defaultColumnOrder: CashAdvanceMultipleEntryItemColumnOrder,
    defaultVisibleColumnIds: CashAdvanceMultipleEntryDefaultItemColumnIds,
    defaultColumnWidths: CashAdvanceMultipleEntryItemColumnWidths,
    defaultColumnLabels: CashAdvanceMultipleEntryItemColumnLabels,
    protectedColumnIds: CashAdvanceMultipleEntryProtectedItemColumnIds,
  });
  const allColumns = useMemo(
    () =>
      createCashAdvanceMultipleEntryItemColumns({
        employeeOptions,
        isReadonly,
        onOpenItemPartyDrawer: onOpenPartyDrawer,
        onOpenItemResponsibilityCenterDrawer: onOpenResponsibilityCenterDrawer,
        onUpdateEntry: (rowId, updates) =>
          onRowsChange(replaceCashAdvanceMultipleEntryRow(rows, rowId, updates)),
        responsibilityCenterOptions,
        rows,
      }),
    [employeeOptions, isReadonly, onOpenPartyDrawer, onOpenResponsibilityCenterDrawer, onRowsChange, responsibilityCenterOptions, rows],
  );
  const columns = useMemo<ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>[]>(
    () =>
      columnOrder
        .filter((columnId) => visibleColumnIds.includes(columnId))
        .map((columnId) => {
          const column = allColumns[columnId];
          if (!column) return null;

          return {
            ...column,
            header: getCurrentColumnLabel(columnId, columnLabels[columnId] ?? column.header),
            width: columnWidths[columnId] ?? column.width,
          };
        })
        .filter((column): column is NonNullable<typeof column> => Boolean(column)),
    [allColumns, columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !CashAdvanceMultipleEntryProtectedItemColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: getCurrentColumnLabel(columnId, columnLabels[columnId] ?? allColumns[columnId]?.header ?? ""),
        width: columnWidths[columnId] ?? allColumns[columnId]?.width,
        widthMode: allColumns[columnId]?.widthMode,
      })),
    [allColumns, columnLabels, columnOrder, columnWidths, visibleColumnIds],
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
      canConfigureColumnsWhenReadonly
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
        if (row) {
          onRowsChange([
            ...rows,
            {
              ...row,
              amount: "",
              cashAdvanceBalance: "",
              cashAdvanceLimit: "",
              id: `came-item-${Date.now()}`,
              partyCode: "",
              partyName: "",
            },
          ]);
        }
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
      onResetColumns={handleResetColumns}
      onMoveColumn={handleMoveColumn}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
    />
  );
}

function getCurrentColumnLabel(columnId: string, label: string) {
  if (columnId === "partyCode" && label === "Party Code") return "Employee Code";
  if (columnId === "partyName" && label === "Party Name") return "Employee Name";
  return label;
}
