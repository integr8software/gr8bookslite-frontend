import { useMemo, useState } from "react";
import {
  RevolvingFundDefaultItemColumnIds,
  RevolvingFundItemColumnLabels,
  RevolvingFundItemColumnWidths,
  RevolvingFundProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import {
  createBlankRevolvingFundItem,
  formatRevolvingFundAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import type {
  RevolvingFundDetailEntryTableProps,
  RevolvingFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { createRevolvingFundItemColumns } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function RevolvingFundDetailEntryTable({ page }: RevolvingFundDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<RevolvingFundItemColumnId[]>([...RevolvingFundDefaultItemColumnIds]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<RevolvingFundItemColumnId[]>([...RevolvingFundDefaultItemColumnIds]);
  const [columnWidths, setColumnWidths] = useState({ ...RevolvingFundItemColumnWidths });
  const [columnLabels, setColumnLabels] = useState({ ...RevolvingFundItemColumnLabels });

  const allColumns = useMemo(
    () => createRevolvingFundItemColumns(page, columnLabels, columnWidths),
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
        RevolvingFundProtectedItemColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isItemColumnId(fromId) && isItemColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isItemColumnId(columnId) && (!isVisible && RevolvingFundProtectedItemColumnIds.has(columnId))) {
      return;
    }
    if (isItemColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isItemColumnId(columnId)) {
      setColumnLabels((labels) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isItemColumnId(columnId)) {
      setColumnWidths((widths) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isItemColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], page.values.items, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...RevolvingFundDefaultItemColumnIds]);
    setVisibleColumnIds([...RevolvingFundDefaultItemColumnIds]);
    setColumnWidths({ ...RevolvingFundItemColumnWidths });
    setColumnLabels({ ...RevolvingFundItemColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title=""
      emptyRowLabel="entry"
      error={page.errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatRevolvingFundAmount(page.totals.amount)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.items}
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addItems}
      onClearRow={(rowId) =>
        page.updateItems(
          page.values.items.map((row) => (row.id === rowId ? { ...createBlankRevolvingFundItem(), id: rowId } : row)),
        )
      }
      onClearRows={() => page.updateItems([createBlankRevolvingFundItem()])}
      onDuplicateRow={page.duplicateItem}
      onInsertRow={page.insertItem}
      onMoveRow={page.moveItem}
      onRemoveRow={page.removeItem}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        amount: formatRevolvingFundAmount(page.totals.amount),
        netAmount: formatRevolvingFundAmount(page.totals.netAmount),
        vatAmount: formatRevolvingFundAmount(page.totals.vatAmount),
        grossAmount: formatRevolvingFundAmount(page.totals.grossAmount),
      }}
    />
  );
}

function isItemColumnId(columnId: string): columnId is RevolvingFundItemColumnId {
  return RevolvingFundDefaultItemColumnIds.includes(columnId as RevolvingFundItemColumnId);
}
