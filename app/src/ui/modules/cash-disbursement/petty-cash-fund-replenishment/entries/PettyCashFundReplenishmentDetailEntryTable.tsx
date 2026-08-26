import { useMemo, useState } from "react";
import {
  PettyCashFundReplenishmentEntryColumnOrder,
  PettyCashFundReplenishmentEntryColumnLabels,
  PettyCashFundReplenishmentEntryColumnWidths,
  PettyCashFundReplenishmentProtectedEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import {
  createBlankPettyCashFundReplenishmentEntry,
  formatPettyCashFundReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import type {
  PettyCashFundReplenishmentDetailEntryTableProps,
  PettyCashFundReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { createPettyCashFundReplenishmentLineColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function PettyCashFundReplenishmentDetailEntryTable({
  page,
}: PettyCashFundReplenishmentDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<PettyCashFundReplenishmentEntryColumnId[]>([
    ...PettyCashFundReplenishmentEntryColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<PettyCashFundReplenishmentEntryColumnId[]>([
    ...PettyCashFundReplenishmentEntryColumnOrder,
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<PettyCashFundReplenishmentEntryColumnId, number>>({
    ...PettyCashFundReplenishmentEntryColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState<Record<PettyCashFundReplenishmentEntryColumnId, string>>({
    ...PettyCashFundReplenishmentEntryColumnLabels,
  });

  const allColumns = useMemo(
    () => createPettyCashFundReplenishmentLineColumns({ columnLabels, columnWidths, page }),
    [columnLabels, columnWidths, page],
  );

  const columns = useMemo(
    () => columnOrder.filter((id) => visibleColumnIds.includes(id)).map((id) => allColumns[id]),
    [allColumns, columnOrder, visibleColumnIds],
  );

  const columnOptions = useMemo(
    () =>
      buildColumnOptions(
        columnOrder,
        columnLabels,
        columnWidths,
        visibleColumnIds,
        PettyCashFundReplenishmentProtectedEntryColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isLineColumnId(fromId) && isLineColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isLineColumnId(columnId) && (!isVisible && PettyCashFundReplenishmentProtectedEntryColumnIds.has(columnId))) {
      return;
    }
    if (isLineColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isLineColumnId(columnId)) {
      setColumnLabels((labels: Record<PettyCashFundReplenishmentEntryColumnId, string>) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isLineColumnId(columnId)) {
      setColumnWidths((widths: Record<PettyCashFundReplenishmentEntryColumnId, number>) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isLineColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], page.values.entries, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...PettyCashFundReplenishmentEntryColumnOrder]);
    setVisibleColumnIds([...PettyCashFundReplenishmentEntryColumnOrder]);
    setColumnWidths({ ...PettyCashFundReplenishmentEntryColumnWidths });
    setColumnLabels({ ...PettyCashFundReplenishmentEntryColumnLabels });
  }

  return (
    <ModuleDataEntry
      title=""
      emptyRowLabel="voucher"
      error={page.errors.entries}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatPettyCashFundReplenishmentAmount(page.totals.totalAmount)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.entries}
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addEntries}
      onClearRows={() => page.updateEntries([createBlankPettyCashFundReplenishmentEntry()])}
      onDuplicateRow={page.duplicateEntry}
      onInsertRow={page.insertEntry}
      onMoveRow={page.moveEntry}
      onRemoveRow={page.removeEntry}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        totalAmount: formatPettyCashFundReplenishmentAmount(page.totals.totalAmount),
        netAmount: formatPettyCashFundReplenishmentAmount(page.totals.netAmount),
        vatAmount: formatPettyCashFundReplenishmentAmount(page.totals.vatAmount),
      }}
    />
  );
}

function isLineColumnId(columnId: string): columnId is PettyCashFundReplenishmentEntryColumnId {
  return PettyCashFundReplenishmentEntryColumnOrder.includes(columnId as PettyCashFundReplenishmentEntryColumnId);
}
