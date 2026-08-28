import { useMemo } from "react";
import {
  CashVoucherDetailTablePreferencesStorageKey,
  DefaultExpenseEntryColumnOrder,
  DefaultExpenseEntryColumnWidths,
  DefaultVisibleExpenseEntryColumnOrder,
  ExpenseEntryColumnLabels,
  MultiCheckColumnIds,
  ProtectedExpenseEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  getCashVoucherEntryExportCell,
  getExpenseEntryColumnTotal,
  isExpenseEntryColumnId,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import { createBlankCashVoucherLineEntry } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { useDataEntryTablePreferences } from "@/app/src/hooks/shared/module/useDataEntryTablePreferences";
import type {
  CashVoucherDetailEntryTableProps,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import { createCashVoucherExpenseEntryColumns } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { formatAmount } from "@/app/src/utils/currency.util";

export function CashVoucherDetailEntryTable({
  accountingColumns,
  canAddExpenseType,
  canAddResponsibilityCenter,
  errors,
  ewtOptions,
  expenseAccounts,
  expenseRows,
  isReadonly,
  lineErrors,
  title = "",
  onAddEntries,
  onAddExpenseType,
  onAddResponsibilityCenter,
  onClearEntries,
  onDuplicateEntry,
  onInsertEntry,
  onMoveEntry,
  onRemoveEntry,
  responsibilityCenterOptions,
  taxCodes,
  updateExpenseEntryFields,
  vatOptions,
}: CashVoucherDetailEntryTableProps) {
  const {
    columnOrder: expenseColumnOrder,
    visibleColumnIds: visibleExpenseColumnIds,
    columnWidths: expenseColumnWidths,
    columnLabels: expenseColumnLabels,
    handleMoveColumn: moveColumn,
    handleToggleColumnVisibility: toggleColumnVisibility,
    handleUpdateColumnHeader: updateColumnHeader,
    handleUpdateColumnWidth: updateColumnWidth,
    handleFitColumnWidth: fitColumnWidth,
    handleResetColumns,
  } = useDataEntryTablePreferences<ExpenseEntryColumnId>({
    storageKey: CashVoucherDetailTablePreferencesStorageKey,
    defaultColumnOrder: DefaultExpenseEntryColumnOrder,
    defaultVisibleColumnIds: DefaultVisibleExpenseEntryColumnOrder,
    defaultColumnWidths: DefaultExpenseEntryColumnWidths,
    defaultColumnLabels: ExpenseEntryColumnLabels,
    protectedColumnIds: ProtectedExpenseEntryColumnIds,
  });

  const hasMultiCheckNumberColumn = false;
  const visibleExpenseColumnOrder = expenseColumnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : visibleExpenseColumnIds.includes(columnId),
  );

  const allExpenseColumns = useMemo(
    () =>
      createCashVoucherExpenseEntryColumns({
        accountingColumns,
        canAddExpenseType,
        canAddResponsibilityCenter,
        ewtOptions,
        expenseAccounts,
        expenseColumnLabels,
        expenseColumnWidths,
        isReadonly,
        lineErrors,
        onAddExpenseType,
        onAddResponsibilityCenter,
        responsibilityCenterOptions,
        taxCodes,
        updateExpenseEntryFields,
        vatOptions,
      }),
    [
      accountingColumns,
      canAddExpenseType,
      canAddResponsibilityCenter,
      ewtOptions,
      expenseAccounts,
      expenseColumnLabels,
      expenseColumnWidths,
      isReadonly,
      lineErrors,
      onAddExpenseType,
      onAddResponsibilityCenter,
      responsibilityCenterOptions,
      taxCodes,
      updateExpenseEntryFields,
      vatOptions,
    ],
  );

  const expenseColumns = useMemo(
    () =>
      visibleExpenseColumnOrder
        .map((columnId) => {
          const col = allExpenseColumns[columnId];
          if (!col) return null;
          return {
            ...col,
            header: expenseColumnLabels[columnId] || col.header,
            width: expenseColumnWidths[columnId] ?? col.width,
          };
        })
        .filter((col): col is NonNullable<typeof col> => col !== null),
    [allExpenseColumns, expenseColumnLabels, expenseColumnWidths, visibleExpenseColumnOrder],
  );

  const expenseColumnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      expenseColumnOrder
        .filter((columnId) => (MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : true))
        .map((columnId) => ({
          id: columnId,
          isHideable: !ProtectedExpenseEntryColumnIds.has(columnId),
          isVisible: visibleExpenseColumnIds.includes(columnId),
          label: expenseColumnLabels[columnId],
          width: expenseColumnWidths[columnId],
        })),
    [expenseColumnLabels, expenseColumnOrder, expenseColumnWidths, hasMultiCheckNumberColumn, visibleExpenseColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isExpenseEntryColumnId(fromId) && isExpenseEntryColumnId(toId)) {
      moveColumn(fromId, toId);
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isExpenseEntryColumnId(columnId)) {
      toggleColumnVisibility(columnId, isVisible);
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isExpenseEntryColumnId(columnId)) {
      updateColumnHeader(columnId, header);
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isExpenseEntryColumnId(columnId)) {
      updateColumnWidth(columnId, width);
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isExpenseEntryColumnId(columnId)) {
      fitColumnWidth(columnId, expenseRows, (entry) => getCashVoucherEntryExportCell(entry, columnId));
    }
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title={title}
      emptyRowLabel="entry"
      error={errors.lineEntries}
      columns={expenseColumns}
      columnOptions={expenseColumnOptions}
      rows={expenseRows}
      isDraggable={!isReadonly}
      isReadonly={isReadonly}
      onAddRows={onAddEntries}
      onClearRow={(rowId) => updateExpenseEntryFields(rowId, createBlankCashVoucherLineEntry({ id: rowId }))}
      onClearRows={onClearEntries}
      onDuplicateRow={onDuplicateEntry}
      onInsertRow={onInsertEntry}
      onMoveRow={onMoveEntry}
      onRemoveRow={onRemoveEntry}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        amount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "amount")),
        ewtAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "ewtAmount")),
        netAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "netAmount")),
        disburseAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "disburseAmount")),
        vatAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "vatAmount")),
      }}
    />
  );
}
