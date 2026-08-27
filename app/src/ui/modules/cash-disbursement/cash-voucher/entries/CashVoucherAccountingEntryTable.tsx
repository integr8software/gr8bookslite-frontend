import { useMemo, useState } from "react";
import {
  CashVoucherEntryColumnLabels,
  DefaultCashVoucherEntryColumnOrder,
  DefaultCashVoucherEntryColumnWidths,
  DefaultVisibleCashVoucherEntryColumnOrder,
  MultiCheckColumnIds,
  ProtectedCashVoucherEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  getCashVoucherEntryExportCell,
  isCashVoucherEntryColumnId,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import type {
  CashVoucherAccountingEntryTableProps,
  CashVoucherEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type { CashVoucherLineEntry } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import type {
  ModuleDataEntryColumn,
  ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { formatAmount } from "@/app/src/utils/currency.util";
import { joinClasses } from "@/app/src/utils/string.util";

export function CashVoucherAccountingEntryTable({
  accountingColumns,
  accountingRows,
  errors,
  isReadonly,
  title,
  onAddEntries,
  onClearEntries,
  onDuplicateEntry,
  onInsertEntry,
  onMoveEntry,
  onRemoveEntry,
  totalCredit = 0,
  totalDebit = 0,
  variance = 0,
}: CashVoucherAccountingEntryTableProps) {
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<CashVoucherEntryColumnId[]>(
    DefaultCashVoucherEntryColumnOrder,
  );
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<CashVoucherEntryColumnId[]>(
    DefaultVisibleCashVoucherEntryColumnOrder,
  );
  const [accountingColumnWidths, setAccountingColumnWidths] = useState(DefaultCashVoucherEntryColumnWidths);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState(CashVoucherEntryColumnLabels);

  const hasMultiCheckNumberColumn = false;
  const visibleAccountingColumnOrder = accountingColumnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : visibleAccountingColumnIds.includes(columnId),
  );

  const columns = useMemo(
    () =>
      visibleAccountingColumnOrder
        .map((columnId) => accountingColumns?.[columnId])
        .filter((col): col is ModuleDataEntryColumn<CashVoucherLineEntry> => Boolean(col)),
    [accountingColumns, visibleAccountingColumnOrder],
  );

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      accountingColumnOrder
        .filter((columnId) => (MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : true))
        .map((columnId) => ({
          id: columnId,
          isHideable: !ProtectedCashVoucherEntryColumnIds.has(columnId),
          isVisible: visibleAccountingColumnIds.includes(columnId),
          label: accountingColumnLabels[columnId],
          width: accountingColumnWidths[columnId],
        })),
    [accountingColumnLabels, accountingColumnOrder, accountingColumnWidths, hasMultiCheckNumberColumn, visibleAccountingColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isCashVoucherEntryColumnId(fromId) && isCashVoucherEntryColumnId(toId)) {
      setAccountingColumnOrder((currentOrder) => reorderColumnIds(currentOrder, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isCashVoucherEntryColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProtectedCashVoucherEntryColumnIds.has(columnId)) {
      return;
    }

    setVisibleAccountingColumnIds((currentIds) =>
      toggleVisibleColumnId(currentIds, accountingColumnOrder, columnId, isVisible),
    );
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isCashVoucherEntryColumnId(columnId)) {
      setAccountingColumnLabels((currentLabels) => ({ ...currentLabels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isCashVoucherEntryColumnId(columnId)) {
      setAccountingColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isCashVoucherEntryColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(
        accountingColumnLabels[columnId],
        accountingRows,
        columnId,
        (entry) => getCashVoucherEntryExportCell(entry, columnId),
      );
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setAccountingColumnOrder(DefaultCashVoucherEntryColumnOrder);
    setVisibleAccountingColumnIds(DefaultVisibleCashVoucherEntryColumnOrder);
    setAccountingColumnWidths(DefaultCashVoucherEntryColumnWidths);
    setAccountingColumnLabels(CashVoucherEntryColumnLabels);
  }

  const computedDebit = totalDebit || accountingRows.reduce((sum, r) => sum + Number(r.debit || 0), 0);
  const computedCredit = totalCredit || accountingRows.reduce((sum, r) => sum + Number(r.credit || 0), 0);
  const computedVariance = variance !== undefined ? variance : Math.abs(computedDebit - computedCredit);

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title={title}
      emptyRowLabel="entry"
      error={errors.lineEntries}
      footerDetails={
        <span
          className={joinClasses(
            "text-sm font-semibold",
            computedVariance > 0.005 ? "text-coralpink" : "text-emerald-600",
          )}
        >
          Variance: {formatAmount(computedVariance)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={accountingRows}
      isDraggable={!isReadonly}
      isReadonly={isReadonly}
      onAddRows={onAddEntries ?? (() => undefined)}
      onClearRows={onClearEntries}
      onDuplicateRow={onDuplicateEntry ?? (() => undefined)}
      onInsertRow={onInsertEntry ?? (() => undefined)}
      onMoveRow={onMoveEntry ?? (() => undefined)}
      onRemoveRow={onRemoveEntry ?? (() => undefined)}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        debit: formatAmount(computedDebit),
        credit: formatAmount(computedCredit),
      }}
    />
  );
}


