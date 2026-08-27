import { useMemo, useState } from "react";
import {
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
import type {
  CashVoucherDetailEntryTableProps,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import { createCashVoucherExpenseEntryColumns } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
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
  const [expenseColumnOrder, setExpenseColumnOrder] = useState<ExpenseEntryColumnId[]>(DefaultExpenseEntryColumnOrder);
  const [visibleExpenseColumnIds, setVisibleExpenseColumnIds] = useState<ExpenseEntryColumnId[]>(
    DefaultVisibleExpenseEntryColumnOrder,
  );
  const [expenseColumnWidths, setExpenseColumnWidths] = useState(DefaultExpenseEntryColumnWidths);
  const [expenseColumnLabels, setExpenseColumnLabels] = useState(ExpenseEntryColumnLabels);

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
    () => visibleExpenseColumnOrder.map((columnId) => allExpenseColumns[columnId]),
    [allExpenseColumns, visibleExpenseColumnOrder],
  );

  const expenseColumnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      expenseColumnOrder
        .filter((columnId) => (MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : true))
        .map((columnId) => ({
          id: columnId,
          isProtected: ProtectedExpenseEntryColumnIds.has(columnId),
          isVisible: visibleExpenseColumnIds.includes(columnId),
          label: expenseColumnLabels[columnId],
          width: expenseColumnWidths[columnId],
        })),
    [expenseColumnLabels, expenseColumnOrder, expenseColumnWidths, hasMultiCheckNumberColumn, visibleExpenseColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isExpenseEntryColumnId(fromId) && isExpenseEntryColumnId(toId)) {
      setExpenseColumnOrder((currentOrder) => reorderColumnIds(currentOrder, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isExpenseEntryColumnId(columnId)) {
      setVisibleExpenseColumnIds((currentIds) =>
        toggleVisibleColumnId(currentIds, expenseColumnOrder, columnId, isVisible),
      );
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isExpenseEntryColumnId(columnId)) {
      setExpenseColumnLabels((currentLabels) => ({ ...currentLabels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isExpenseEntryColumnId(columnId)) {
      setExpenseColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isExpenseEntryColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(
        expenseColumnLabels[columnId],
        expenseRows,
        columnId,
        (entry) => getCashVoucherEntryExportCell(entry, columnId),
      );
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setExpenseColumnOrder(DefaultExpenseEntryColumnOrder);
    setVisibleExpenseColumnIds(DefaultVisibleExpenseEntryColumnOrder);
    setExpenseColumnWidths(DefaultExpenseEntryColumnWidths);
    setExpenseColumnLabels(ExpenseEntryColumnLabels);
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title={title}
      emptyRowLabel="entry"
      error={errors.lineEntries}
      footerDetails={
        <span className="text-sm font-semibold text-emerald-600">
          Total Amount: {formatAmount(getExpenseEntryColumnTotal(expenseRows, "amount"))}
        </span>
      }
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
        vatAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "vatAmount")),
      }}
    />
  );
}
