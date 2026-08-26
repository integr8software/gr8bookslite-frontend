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
  estimateCashVoucherEntryTextWidth,
  getExpenseEntryColumnTotal,
  isExpenseEntryColumnId,
  moveEntryColumn,
  updateVisibleEntryColumns,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import { createBlankCashVoucherLineEntry } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherDetailEntryTableProps,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import { createCashVoucherExpenseEntryColumns } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherEntryColumns";
import { TabbedModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
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
      setExpenseColumnOrder((currentOrder) => moveEntryColumn(currentOrder, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isExpenseEntryColumnId(columnId)) {
      setVisibleExpenseColumnIds((currentIds) =>
        updateVisibleEntryColumns(currentIds, expenseColumnOrder, columnId, isVisible),
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
      const headerWidth = estimateCashVoucherEntryTextWidth(expenseColumnLabels[columnId], 76);
      const contentWidth = expenseRows.reduce((currentWidth, entry) => {
        switch (columnId) {
          case "partyCode":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.partyCode ?? "", 24));
          case "partyName":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.partyName ?? "", 24));
          case "disbursementCode":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.accountCode, 24));
          case "expenseType":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.accountName, 24));
          case "amount":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(formatAmount(entry.taxDetails.grossAmount), 24));
          case "checkNo":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.checkNo ?? "", 24));
          case "checkStatus":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.checkStatus ?? "", 24));
          case "checkDate":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.checkDate ?? "", 24));
          case "netAmount":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(formatAmount(entry.taxDetails.netAmount), 24));
          case "vatCode":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.taxDetails.vatCode ?? "", 24));
          case "vatPercent":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(`${formatAmount(entry.taxDetails.vatPercent)}%`, 24));
          case "vatAmount":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(formatAmount(entry.taxDetails.vatAmount), 24));
          case "ewtCode":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.taxDetails.ewtCode ?? "", 24));
          case "ewtPercent":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(`${formatAmount(entry.taxDetails.ewtPercent)}%`, 24));
          case "ewtAmount":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(formatAmount(entry.taxDetails.ewtAmount), 24));
          case "totalAmountDue":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(formatAmount(entry.taxDetails.amount), 24));
          case "remarks":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.remarks, 24));
          case "responsibilityCenter":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.responsibilityCenter ?? "", 24));
          case "refId":
            return Math.max(currentWidth, estimateCashVoucherEntryTextWidth(entry.refId ?? "", 24));
          default:
            return currentWidth;
        }
      }, 50);

      handleUpdateColumnWidth(columnId, Math.max(headerWidth, contentWidth));
    }
  }

  function handleResetColumns() {
    setExpenseColumnOrder(DefaultExpenseEntryColumnOrder);
    setVisibleExpenseColumnIds(DefaultVisibleExpenseEntryColumnOrder);
    setExpenseColumnWidths(DefaultExpenseEntryColumnWidths);
    setExpenseColumnLabels(ExpenseEntryColumnLabels);
  }

  return (
    <TabbedModuleDataEntry
      addButtonLabel="Add Entry"
      title=""
      emptyRowLabel="entry"
      error={errors.lineEntries}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatAmount(getExpenseEntryColumnTotal(expenseRows, "totalAmountDue"))}
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
        totalAmountDue: formatAmount(getExpenseEntryColumnTotal(expenseRows, "totalAmountDue")),
        vatAmount: formatAmount(getExpenseEntryColumnTotal(expenseRows, "vatAmount")),
      }}
    />
  );
}
