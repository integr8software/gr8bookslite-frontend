import { useMemo, useState } from "react";
import {
  RequestForPaymentDefaultItemColumnIds,
  RequestForPaymentDefaultVisibleItemColumnIds,
  RequestForPaymentItemColumnLabels,
  RequestForPaymentItemColumnWidths,
  RequestForPaymentProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import {
  createBlankRequestForPaymentItem,
} from "@/app/src/data/modules/cash-disbursement/request-for-payment/RequestForPaymentData";
import type {
  RequestForPaymentDetailEntryTableProps,
  RequestForPaymentItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { createRequestForPaymentItemColumns } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/entries/RequestForPaymentEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { formatCurrency } from "@/app/src/utils/currency.util";

export function RequestForPaymentDetailEntryTable({
  onOpenResponsibilityCenterDrawer,
  page,
}: RequestForPaymentDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<RequestForPaymentItemColumnId[]>([
    ...RequestForPaymentDefaultItemColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<RequestForPaymentItemColumnId[]>([
    ...RequestForPaymentDefaultVisibleItemColumnIds,
  ]);
  const [columnWidths, setColumnWidths] = useState({ ...RequestForPaymentItemColumnWidths });
  const [columnLabels, setColumnLabels] = useState({ ...RequestForPaymentItemColumnLabels });

  const allColumns = useMemo(
    () =>
      createRequestForPaymentItemColumns(
        page,
        columnLabels,
        columnWidths,
        onOpenResponsibilityCenterDrawer,
      ),
    [columnLabels, columnWidths, onOpenResponsibilityCenterDrawer, page],
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
        RequestForPaymentProtectedItemColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isItemColumnId(fromId) && isItemColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isItemColumnId(columnId) && (!isVisible && RequestForPaymentProtectedItemColumnIds.has(columnId))) {
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
    setColumnOrder([...RequestForPaymentDefaultItemColumnIds]);
    setVisibleColumnIds([...RequestForPaymentDefaultVisibleItemColumnIds]);
    setColumnWidths({ ...RequestForPaymentItemColumnWidths });
    setColumnLabels({ ...RequestForPaymentItemColumnLabels });
  }

  function handleDuplicateRow(rowId: string) {
    const row = page.values.items.find((item) => item.id === rowId);
    if (!row) return;
    const nextRow = {
      ...row,
      id: `rfp-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    page.updateField("items", [...page.values.items, nextRow]);
  }

  function handleInsertRow(targetRowId: string, position: "above" | "below") {
    const index = page.values.items.findIndex((row) => row.id === targetRowId);
    if (index === -1) return;
    const newRow = createBlankRequestForPaymentItem();
    const nextItems = [...page.values.items];
    nextItems.splice(position === "above" ? index : index + 1, 0, newRow);
    page.updateField("items", nextItems);
  }

  function handleMoveRow(fromRowId: string, toRowId: string) {
    const fromIndex = page.values.items.findIndex((row) => row.id === fromRowId);
    const toIndex = page.values.items.findIndex((row) => row.id === toRowId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...page.values.items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    page.reorderItems(next);
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Request Item"
      title="Payment Request Items"
      emptyRowLabel="item"
      error={page.errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatCurrency(page.totals.totalAmount)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.items}
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addItem}
      onClearRow={(rowId) =>
        page.updateField(
          "items",
          page.values.items.map((row) => (row.id === rowId ? { ...createBlankRequestForPaymentItem(), id: rowId } : row)),
        )
      }
      onClearRows={() => page.updateField("items", [createBlankRequestForPaymentItem()])}
      onDuplicateRow={handleDuplicateRow}
      onInsertRow={handleInsertRow}
      onMoveRow={handleMoveRow}
      onRemoveRow={(rowId) => page.removeItem(rowId)}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        amount: formatCurrency(page.totals.totalAmount),
      }}
    />
  );
}

function isItemColumnId(columnId: string): columnId is RequestForPaymentItemColumnId {
  return RequestForPaymentDefaultItemColumnIds.includes(columnId as RequestForPaymentItemColumnId);
}
