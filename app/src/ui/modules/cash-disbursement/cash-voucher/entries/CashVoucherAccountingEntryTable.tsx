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
  calculateCashVoucherEntryColumnFitWidth,
  isCashVoucherEntryColumnId,
  moveEntryColumn,
  updateVisibleEntryColumns,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import type {
  CashVoucherAccountingEntryTableProps,
  CashVoucherEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import { TabbedModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { formatAmount } from "@/app/src/utils/currency.util";

export function CashVoucherAccountingEntryTable({
  accountingColumns,
  accountingRows,
  errors,
  isReadonly,
  onAddEntries,
  onClearEntries,
  totalCredit,
  totalDebit,
  variance,
}: CashVoucherAccountingEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<CashVoucherEntryColumnId[]>(DefaultCashVoucherEntryColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<CashVoucherEntryColumnId[]>(
    DefaultVisibleCashVoucherEntryColumnOrder,
  );
  const [columnWidths, setColumnWidths] = useState(DefaultCashVoucherEntryColumnWidths);
  const [columnLabels, setColumnLabels] = useState(CashVoucherEntryColumnLabels);

  const hasMultiCheckNumberColumn = false;
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : visibleColumnIds.includes(columnId),
  );

  const columns = useMemo(
    () =>
      visibleColumnOrder.map((columnId) => ({
        ...accountingColumns[columnId],
        header: columnLabels[columnId],
        width: columnWidths[columnId],
      })),
    [accountingColumns, columnLabels, columnWidths, visibleColumnOrder],
  );

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder
        .filter((columnId) => (MultiCheckColumnIds.has(columnId) ? hasMultiCheckNumberColumn : true))
        .map((columnId) => ({
          id: columnId,
          isProtected: ProtectedCashVoucherEntryColumnIds.has(columnId),
          isVisible: visibleColumnIds.includes(columnId),
          label: columnLabels[columnId],
          width: columnWidths[columnId],
        })),
    [columnLabels, columnOrder, columnWidths, hasMultiCheckNumberColumn, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isCashVoucherEntryColumnId(fromId) && isCashVoucherEntryColumnId(toId)) {
      setColumnOrder((currentOrder) => moveEntryColumn(currentOrder, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isCashVoucherEntryColumnId(columnId)) {
      setVisibleColumnIds((currentIds) => updateVisibleEntryColumns(currentIds, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isCashVoucherEntryColumnId(columnId)) {
      setColumnLabels((currentLabels) => ({ ...currentLabels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isCashVoucherEntryColumnId(columnId)) {
      setColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isCashVoucherEntryColumnId(columnId)) {
      const fitWidth = calculateCashVoucherEntryColumnFitWidth({
        columnId,
        columnLabels,
        entries: accountingRows,
      });

      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder(DefaultCashVoucherEntryColumnOrder);
    setVisibleColumnIds(DefaultVisibleCashVoucherEntryColumnOrder);
    setColumnWidths(DefaultCashVoucherEntryColumnWidths);
    setColumnLabels(CashVoucherEntryColumnLabels);
  }

  return (
    <TabbedModuleDataEntry
      addButtonLabel="Add Entry"
      title=""
      emptyRowLabel="entry"
      error={errors.lineEntries}
      footerDetails={
        <span className={`text-sm font-semibold ${variance < 0.001 ? "text-emerald-700" : "text-coralpink"}`}>
          Variance: {formatAmount(variance)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      canConfigureColumnsWhenReadonly
      canManageRowsWhenReadonly={!isReadonly}
      rows={accountingRows}
      isDraggable={false}
      isReadonly
      onAddRows={onAddEntries}
      onClearRows={onClearEntries}
      onDuplicateRow={() => {}}
      onInsertRow={() => {}}
      onMoveRow={() => {}}
      onRemoveRow={() => {}}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        credit: formatAmount(totalCredit),
        debit: formatAmount(totalDebit),
      }}
    />
  );
}
