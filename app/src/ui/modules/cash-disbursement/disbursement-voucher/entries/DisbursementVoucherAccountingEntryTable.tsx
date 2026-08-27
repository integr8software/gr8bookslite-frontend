import { useMemo, useState } from "react";
import {
  DefaultDisbursementEntryColumnOrder,
  DefaultDisbursementEntryColumnWidths,
  DefaultVisibleDisbursementEntryColumnOrder,
  DisbursementEntryColumnLabels,
  MultiCheckColumnIds,
  ProtectedDisbursementEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  getDisbursementEntryExportCell,
  isDisbursementEntryColumnId,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import type {
  DisbursementEntryColumnId,
  DisbursementVoucherAccountingEntryTableProps,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type { DisbursementLineEntry } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
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

export function DisbursementVoucherAccountingEntryTable({
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
}: DisbursementVoucherAccountingEntryTableProps) {
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<DisbursementEntryColumnId[]>(
    DefaultDisbursementEntryColumnOrder,
  );
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<DisbursementEntryColumnId[]>(
    DefaultVisibleDisbursementEntryColumnOrder,
  );
  const [accountingColumnWidths, setAccountingColumnWidths] = useState(DefaultDisbursementEntryColumnWidths);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState(DisbursementEntryColumnLabels);

  const hasMultiCheckNumberColumn = false;
  const visibleAccountingColumnOrder = accountingColumnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : visibleAccountingColumnIds.includes(columnId),
  );

  const columns = useMemo(
    () =>
      visibleAccountingColumnOrder
        .map((columnId) => accountingColumns?.[columnId])
        .filter((col): col is ModuleDataEntryColumn<DisbursementLineEntry> => Boolean(col)),
    [accountingColumns, visibleAccountingColumnOrder],
  );

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      accountingColumnOrder
        .filter((columnId) => (MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : true))
        .map((columnId) => ({
          id: columnId,
          isProtected: ProtectedDisbursementEntryColumnIds.has(columnId),
          isVisible: visibleAccountingColumnIds.includes(columnId),
          label: accountingColumnLabels[columnId],
          width: accountingColumnWidths[columnId],
        })),
    [accountingColumnLabels, accountingColumnOrder, accountingColumnWidths, hasMultiCheckNumberColumn, visibleAccountingColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isDisbursementEntryColumnId(fromId) && isDisbursementEntryColumnId(toId)) {
      setAccountingColumnOrder((currentOrder) => reorderColumnIds(currentOrder, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isDisbursementEntryColumnId(columnId)) {
      setVisibleAccountingColumnIds((currentIds) =>
        toggleVisibleColumnId(currentIds, accountingColumnOrder, columnId, isVisible),
      );
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isDisbursementEntryColumnId(columnId)) {
      setAccountingColumnLabels((currentLabels) => ({ ...currentLabels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isDisbursementEntryColumnId(columnId)) {
      setAccountingColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isDisbursementEntryColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(
        accountingColumnLabels[columnId],
        accountingRows,
        columnId,
        (entry) => getDisbursementEntryExportCell(entry, columnId),
      );
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setAccountingColumnOrder(DefaultDisbursementEntryColumnOrder);
    setVisibleAccountingColumnIds(DefaultVisibleDisbursementEntryColumnOrder);
    setAccountingColumnWidths(DefaultDisbursementEntryColumnWidths);
    setAccountingColumnLabels(DisbursementEntryColumnLabels);
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


