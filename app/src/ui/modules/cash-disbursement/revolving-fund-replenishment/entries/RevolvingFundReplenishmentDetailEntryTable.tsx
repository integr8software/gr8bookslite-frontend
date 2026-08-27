import { useMemo, useState } from "react";
import {
  RevolvingFundReplenishmentEntryColumnOrder,
  RevolvingFundReplenishmentEntryColumnLabels,
  RevolvingFundReplenishmentEntryColumnWidths,
  RevolvingFundReplenishmentProtectedEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import {
  createBlankRevolvingFundReplenishmentEntry,
  formatRevolvingFundReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";

import type {
  RevolvingFundReplenishmentDetailEntryTableProps,
  RevolvingFundReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { createRevolvingFundReplenishmentLineColumns } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function RevolvingFundReplenishmentDetailEntryTable({
  page,
}: RevolvingFundReplenishmentDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<RevolvingFundReplenishmentEntryColumnId[]>([
    ...RevolvingFundReplenishmentEntryColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<RevolvingFundReplenishmentEntryColumnId[]>([
    ...RevolvingFundReplenishmentEntryColumnOrder,
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<RevolvingFundReplenishmentEntryColumnId, number>>({
    ...RevolvingFundReplenishmentEntryColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState<Record<RevolvingFundReplenishmentEntryColumnId, string>>({
    ...RevolvingFundReplenishmentEntryColumnLabels,
  });

  const allColumns = useMemo(
    () => createRevolvingFundReplenishmentLineColumns({ columnLabels, columnWidths, page }),
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
        RevolvingFundReplenishmentProtectedEntryColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isLineColumnId(fromId) && isLineColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isLineColumnId(columnId) && (!isVisible && RevolvingFundReplenishmentProtectedEntryColumnIds.has(columnId))) {
      return;
    }
    if (isLineColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isLineColumnId(columnId)) {
      setColumnLabels((labels: Record<RevolvingFundReplenishmentEntryColumnId, string>) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isLineColumnId(columnId)) {
      setColumnWidths((widths: Record<RevolvingFundReplenishmentEntryColumnId, number>) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isLineColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], page.values.entries, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...RevolvingFundReplenishmentEntryColumnOrder]);
    setVisibleColumnIds([...RevolvingFundReplenishmentEntryColumnOrder]);
    setColumnWidths({ ...RevolvingFundReplenishmentEntryColumnWidths });
    setColumnLabels({ ...RevolvingFundReplenishmentEntryColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title="Revolving Fund Entries"
      emptyRowLabel="entry"
      error={page.errors.entries}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatRevolvingFundReplenishmentAmount(page.totals.totalAmount)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.entries}
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addEntries}
      onClearRow={(rowId) =>
        page.updateEntries(
          page.values.entries.map((row) =>
            row.id === rowId ? { ...createBlankRevolvingFundReplenishmentEntry(), id: rowId } : row,
          ),
        )
      }
      onClearRows={() => page.updateEntries([createBlankRevolvingFundReplenishmentEntry()])}
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
        amount: formatRevolvingFundReplenishmentAmount(page.totals.totalAmount),
        netAmount: formatRevolvingFundReplenishmentAmount(page.totals.netAmount),
        vatAmount: formatRevolvingFundReplenishmentAmount(page.totals.vatAmount),
        ewtAmount: formatRevolvingFundReplenishmentAmount(page.totals.ewtAmount),
      }}
    />
  );
}

function isLineColumnId(columnId: string): columnId is RevolvingFundReplenishmentEntryColumnId {
  return RevolvingFundReplenishmentEntryColumnOrder.includes(columnId as RevolvingFundReplenishmentEntryColumnId);
}
