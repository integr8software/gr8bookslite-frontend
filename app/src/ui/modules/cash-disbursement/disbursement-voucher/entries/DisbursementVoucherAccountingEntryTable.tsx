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
  calculateDisbursementEntryColumnFitWidth,
  isDisbursementEntryColumnId,
  moveEntryColumn,
  updateVisibleEntryColumns,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import type {
  DisbursementEntryColumnId,
  DisbursementVoucherAccountingEntryTableProps,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import { TabbedModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { formatAmount } from "@/app/src/utils/currency.util";

export function DisbursementVoucherAccountingEntryTable({
  accountingColumns,
  accountingRows,
  errors,
  isReadonly,
  onAddEntries,
  onClearEntries,
  totalCredit,
  totalDebit,
  variance,
}: DisbursementVoucherAccountingEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<DisbursementEntryColumnId[]>(DefaultDisbursementEntryColumnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<DisbursementEntryColumnId[]>(
    DefaultVisibleDisbursementEntryColumnOrder,
  );
  const [columnWidths, setColumnWidths] = useState(DefaultDisbursementEntryColumnWidths);
  const [columnLabels, setColumnLabels] = useState(DisbursementEntryColumnLabels);

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
          isProtected: ProtectedDisbursementEntryColumnIds.has(columnId),
          isVisible: visibleColumnIds.includes(columnId),
          label: columnLabels[columnId],
          width: columnWidths[columnId],
        })),
    [columnLabels, columnOrder, columnWidths, hasMultiCheckNumberColumn, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isDisbursementEntryColumnId(fromId) && isDisbursementEntryColumnId(toId)) {
      setColumnOrder((currentOrder) => moveEntryColumn(currentOrder, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isDisbursementEntryColumnId(columnId)) {
      setVisibleColumnIds((currentIds) => updateVisibleEntryColumns(currentIds, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isDisbursementEntryColumnId(columnId)) {
      setColumnLabels((currentLabels) => ({ ...currentLabels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isDisbursementEntryColumnId(columnId)) {
      setColumnWidths((currentWidths) => ({
        ...currentWidths,
        [columnId]: clampColumnWidth(width),
      }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isDisbursementEntryColumnId(columnId)) {
      const fitWidth = calculateDisbursementEntryColumnFitWidth({
        columnId,
        columnLabels,
        entries: accountingRows,
      });

      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder(DefaultDisbursementEntryColumnOrder);
    setVisibleColumnIds(DefaultVisibleDisbursementEntryColumnOrder);
    setColumnWidths(DefaultDisbursementEntryColumnWidths);
    setColumnLabels(DisbursementEntryColumnLabels);
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
