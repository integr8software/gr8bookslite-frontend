import { useMemo } from "react";
import {
  CashAdvanceDetailTablePreferencesStorageKey,
  CashAdvanceDefaultItemColumnIds,
  CashAdvanceItemColumnLabels,
  CashAdvanceItemColumnOrder,
  CashAdvanceItemColumnWidths,
  CashAdvanceProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import {
  calculateCashAdvanceTotal,
  createBlankCashAdvanceItem,
  formatCashAdvanceAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import {
  removeCashAdvanceRow,
  replaceCashAdvanceRow,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { useDataEntryTablePreferences } from "@/app/src/hooks/shared/module/useDataEntryTablePreferences";
import type {
  CashAdvanceDetailEntryTableProps,
  CashAdvanceItem,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { createCashAdvanceItemColumns } from "@/app/src/ui/modules/cash-disbursement/cash-advance/entries/CashAdvanceEntryColumns";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function CashAdvanceDetailEntryTable({
  employeeOptions,
  isReadonly,
  onAddRows,
  onOpenPartyDrawer,
  onOpenResponsibilityCenterDrawer,
  onRowsChange,
  responsibilityCenterOptions,
  rows,
}: CashAdvanceDetailEntryTableProps) {
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
    storageKey: CashAdvanceDetailTablePreferencesStorageKey,
    defaultColumnOrder: CashAdvanceItemColumnOrder,
    defaultVisibleColumnIds: CashAdvanceDefaultItemColumnIds,
    defaultColumnWidths: CashAdvanceItemColumnWidths,
    defaultColumnLabels: CashAdvanceItemColumnLabels,
    protectedColumnIds: CashAdvanceProtectedItemColumnIds,
  });
  const allColumns = useMemo(
    () =>
      createCashAdvanceItemColumns({
        employeeOptions,
        isReadonly,
        onOpenItemPartyDrawer: onOpenPartyDrawer,
        onOpenItemResponsibilityCenterDrawer: onOpenResponsibilityCenterDrawer,
        onUpdateEntry: (rowId, updates) =>
          onRowsChange(replaceCashAdvanceRow(rows, rowId, updates)),
        responsibilityCenterOptions,
        rows,
      }),
    [employeeOptions, isReadonly, onOpenPartyDrawer, onOpenResponsibilityCenterDrawer, onRowsChange, responsibilityCenterOptions, rows],
  );
  const columns = useMemo<ModuleDataEntryColumn<CashAdvanceItem>[]>(
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
        isHideable: !CashAdvanceProtectedItemColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: getCurrentColumnLabel(columnId, columnLabels[columnId] ?? allColumns[columnId]?.header ?? ""),
        width: columnWidths[columnId] ?? allColumns[columnId]?.width,
        widthMode: allColumns[columnId]?.widthMode,
      })),
    [allColumns, columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );
  const totalAmount = useMemo(() => calculateCashAdvanceTotal(rows), [rows]);

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      columns={columns}
      columnOptions={columnOptions}
      emptyRowLabel="entry"
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatCashAdvanceAmount(totalAmount)}
        </span>
      }
      canConfigureColumnsWhenReadonly
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{ amount: formatCashAdvanceAmount(totalAmount) }}
      summaryRowHeader="Totals"
      title="Cash Advance Entries"
      onAddRows={onAddRows}
      onClearRow={(rowId) =>
        onRowsChange(
          rows.map((row) => (row.id === rowId ? { ...createBlankCashAdvanceItem(), id: rowId } : row)),
        )
      }
      onClearRows={() => onRowsChange([createBlankCashAdvanceItem()])}
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
              id: `ca-item-${Date.now()}`,
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
            ? removeCashAdvanceRow(rows, rowId)
            : [createBlankCashAdvanceItem()],
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
