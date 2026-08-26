import { useMemo, useState } from "react";
import {
  DefaultExpenseEntryColumnOrder,
  DefaultExpenseEntryColumnWidths,
  DefaultVisibleExpenseEntryColumnOrder,
  ExpenseEntryColumnLabels,
  MultiCheckColumnIds,
  ProtectedExpenseEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  estimateDisbursementEntryTextWidth,
  getExpenseEntryColumnTotal,
  isExpenseEntryColumnId,
  moveEntryColumn,
  updateVisibleEntryColumns,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import type {
  DisbursementVoucherDetailEntryTableProps,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import { createDisbursementExpenseEntryColumns } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherEntryColumns";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { formatAmount } from "@/app/src/utils/currency.util";

export function DisbursementVoucherDetailEntryTable({
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
}: DisbursementVoucherDetailEntryTableProps) {
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
      createDisbursementExpenseEntryColumns({
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
      const headerWidth = estimateDisbursementEntryTextWidth(expenseColumnLabels[columnId], 76);
      const contentWidth = expenseRows.reduce((currentWidth, entry) => {
        switch (columnId) {
          case "partyCode":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.partyCode ?? "", 24));
          case "partyName":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.partyName ?? "", 24));
          case "disbursementCode":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.accountCode, 24));
          case "expenseType":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.accountName, 24));
          case "amount":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(formatAmount(entry.taxDetails.grossAmount), 24));
          case "checkNo":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.checkNo ?? "", 24));
          case "checkStatus":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.checkStatus ?? "", 24));
          case "checkDate":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.checkDate ?? "", 24));
          case "netAmount":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(formatAmount(entry.taxDetails.netAmount), 24));
          case "vatCode":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.taxDetails.vatCode ?? "", 24));
          case "vatPercent":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(`${formatAmount(entry.taxDetails.vatPercent)}%`, 24));
          case "vatAmount":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(formatAmount(entry.taxDetails.vatAmount), 24));
          case "ewtCode":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.taxDetails.ewtCode ?? "", 24));
          case "ewtPercent":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(`${formatAmount(entry.taxDetails.ewtPercent)}%`, 24));
          case "ewtAmount":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(formatAmount(entry.taxDetails.ewtAmount), 24));
          case "totalAmountDue":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(formatAmount(entry.taxDetails.amount), 24));
          case "remarks":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.remarks, 24));
          case "responsibilityCenter":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.responsibilityCenter ?? "", 24));
          case "refId":
            return Math.max(currentWidth, estimateDisbursementEntryTextWidth(entry.refId ?? "", 24));
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
    <ModuleDataEntry
      title=""
      emptyRowLabel="disbursement item"
      error={errors.lineEntries}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount Due: {formatAmount(getExpenseEntryColumnTotal(expenseRows, "totalAmountDue"))}
        </span>
      }
      columns={expenseColumns}
      columnOptions={expenseColumnOptions}
      rows={expenseRows}
      isDraggable={!isReadonly}
      isReadonly={isReadonly}
      onAddRows={onAddEntries}
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
