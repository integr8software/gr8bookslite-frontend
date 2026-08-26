import { useMemo, useState } from "react";
import {
  PettyCashFundDefaultItemColumnIds,
  PettyCashFundItemColumnLabels,
  PettyCashFundItemColumnWidths,
  PettyCashFundProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  createBlankPettyCashFundItem,
  formatPettyCashFundAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type {
  PettyCashFundDetailEntryTableProps,
  PettyCashFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { createPettyCashFundItemColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function PettyCashFundDetailEntryTable({ page }: PettyCashFundDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<PettyCashFundItemColumnId[]>([...PettyCashFundDefaultItemColumnIds]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<PettyCashFundItemColumnId[]>([...PettyCashFundDefaultItemColumnIds]);
  const [columnWidths, setColumnWidths] = useState({ ...PettyCashFundItemColumnWidths });
  const [columnLabels, setColumnLabels] = useState({ ...PettyCashFundItemColumnLabels });

  const allColumns = useMemo(
    () => createPettyCashFundItemColumns(page, columnLabels, columnWidths),
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
        PettyCashFundProtectedItemColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isItemColumnId(fromId) && isItemColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isItemColumnId(columnId) && (!isVisible && PettyCashFundProtectedItemColumnIds.has(columnId))) {
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
    setColumnOrder([...PettyCashFundDefaultItemColumnIds]);
    setVisibleColumnIds([...PettyCashFundDefaultItemColumnIds]);
    setColumnWidths({ ...PettyCashFundItemColumnWidths });
    setColumnLabels({ ...PettyCashFundItemColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title=""
      emptyRowLabel="entry"
      error={page.errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatPettyCashFundAmount(page.totals.amount)}
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
          page.values.items.map((row) => (row.id === rowId ? { ...createBlankPettyCashFundItem(), id: rowId } : row)),
        )
      }
      onClearRows={() => page.updateItems([createBlankPettyCashFundItem()])}
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
        amount: formatPettyCashFundAmount(page.totals.amount),
        netAmount: formatPettyCashFundAmount(page.totals.netAmount),
        vatAmount: formatPettyCashFundAmount(page.totals.vatAmount),
        grossAmount: formatPettyCashFundAmount(page.totals.grossAmount),
      }}
    />
  );
}

function isItemColumnId(columnId: string): columnId is PettyCashFundItemColumnId {
  return PettyCashFundDefaultItemColumnIds.includes(columnId as PettyCashFundItemColumnId);
}
