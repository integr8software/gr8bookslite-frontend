import { useMemo, useState } from "react";
import {
  PettyCashFundAccountingColumnLabels,
  PettyCashFundAccountingColumnWidths,
  PettyCashFundDefaultAccountingColumnIds,
  PettyCashFundDefaultItemColumnIds,
  PettyCashFundItemColumnLabels,
  PettyCashFundItemColumnWidths,
  PettyCashFundProtectedAccountingColumnIds,
  PettyCashFundProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  createBlankPettyCashFundItem,
  formatPettyCashFundAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFundActionPage";
import type {
  PettyCashFundAccountingColumnId,
  PettyCashFundAccountingEntry,
  PettyCashFundEntryTab,
  PettyCashFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundEntryTabs } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundEntryTabs";
import {
  createPettyCashFundAccountingColumns,
  createPettyCashFundItemColumns,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundLineColumns";
import { ModuleDataEntry, type ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function PettyCashFundEntrySection({ page }: { page: PettyCashFundActionPageState }) {
  const [activeTab, setActiveTab] = useState<PettyCashFundEntryTab>("items");
  const [itemColumnOrder, setItemColumnOrder] = useState<PettyCashFundItemColumnId[]>([...PettyCashFundDefaultItemColumnIds]);
  const [visibleItemColumnIds, setVisibleItemColumnIds] = useState<PettyCashFundItemColumnId[]>([...PettyCashFundDefaultItemColumnIds]);
  const [itemColumnWidths, setItemColumnWidths] = useState({ ...PettyCashFundItemColumnWidths });
  const [itemColumnLabels, setItemColumnLabels] = useState({ ...PettyCashFundItemColumnLabels });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<PettyCashFundAccountingColumnId[]>([
    ...PettyCashFundDefaultAccountingColumnIds,
  ]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<PettyCashFundAccountingColumnId[]>([
    ...PettyCashFundDefaultAccountingColumnIds,
  ]);
  const [accountingColumnWidths, setAccountingColumnWidths] = useState({ ...PettyCashFundAccountingColumnWidths });
  const [accountingColumnLabels, setAccountingColumnLabels] = useState({ ...PettyCashFundAccountingColumnLabels });
  const allItemColumns = useMemo(
    () => createPettyCashFundItemColumns(page, itemColumnLabels, itemColumnWidths),
    [itemColumnLabels, itemColumnWidths, page],
  );
  const columns = itemColumnOrder.filter((columnId) => visibleItemColumnIds.includes(columnId)).map((columnId) => allItemColumns[columnId]);
  const accountingRows = useMemo<PettyCashFundAccountingEntry[]>(() => {
    const total = page.totals.grossAmount;
    return [
      {
        id: "pcf-accounting-debit",
        accountCode: page.values.accountCode,
        accountTitle: page.values.accountTitle,
        debit: formatPettyCashFundAmount(total),
        credit: "0.00",
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        particulars: page.values.remarks,
      },
      {
        id: "pcf-accounting-credit",
        accountCode: "101-100",
        accountTitle: "Cash in Bank",
        debit: "0.00",
        credit: formatPettyCashFundAmount(total),
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        particulars: page.values.remarks,
      },
    ];
  }, [
    page.totals.grossAmount,
    page.values.accountCode,
    page.values.accountTitle,
    page.values.partyCode,
    page.values.partyName,
    page.values.remarks,
  ]);
  const allAccountingColumns = useMemo(
    () => createPettyCashFundAccountingColumns(accountingColumnLabels, accountingColumnWidths),
    [accountingColumnLabels, accountingColumnWidths],
  );
  const accountingColumns = accountingColumnOrder
    .filter((columnId) => visibleAccountingColumnIds.includes(columnId))
    .map((columnId) => allAccountingColumns[columnId]);
  const itemColumnOptions: ModuleDataEntryColumnOption[] = itemColumnOrder.map((columnId) => ({
    id: columnId,
    label: itemColumnLabels[columnId],
    isVisible: visibleItemColumnIds.includes(columnId),
    isHideable: !PettyCashFundProtectedItemColumnIds.has(columnId),
    width: itemColumnWidths[columnId],
    widthMode: "fixed",
  }));
  const accountingColumnOptions: ModuleDataEntryColumnOption[] = accountingColumnOrder.map((columnId) => ({
    id: columnId,
    label: accountingColumnLabels[columnId],
    isVisible: visibleAccountingColumnIds.includes(columnId),
    isHideable: !PettyCashFundProtectedAccountingColumnIds.has(columnId),
    width: accountingColumnWidths[columnId],
    widthMode: "fixed",
  }));
  const title = <PettyCashFundEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />;

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (activeTab === "accounting") {
      if (!isAccountingColumnId(fromColumnId) || !isAccountingColumnId(toColumnId)) return;
      setAccountingColumnOrder((order) => moveColumnId(order, fromColumnId, toColumnId));
      return;
    }

    if (!isItemColumnId(fromColumnId) || !isItemColumnId(toColumnId)) return;
    setItemColumnOrder((order) => moveColumnId(order, fromColumnId, toColumnId));
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (activeTab === "accounting") {
      if (!isAccountingColumnId(columnId) || (!isVisible && PettyCashFundProtectedAccountingColumnIds.has(columnId))) return;
      setVisibleAccountingColumnIds((ids) => updateVisibleColumnIds(ids, accountingColumnOrder, columnId, isVisible));
      return;
    }

    if (!isItemColumnId(columnId) || (!isVisible && PettyCashFundProtectedItemColumnIds.has(columnId))) return;
    setVisibleItemColumnIds((ids) => updateVisibleColumnIds(ids, itemColumnOrder, columnId, isVisible));
  }

  function updateColumnHeader(columnId: string, header: string) {
    if (activeTab === "accounting" && isAccountingColumnId(columnId)) {
      setAccountingColumnLabels((labels) => ({ ...labels, [columnId]: header }));
    } else if (activeTab === "items" && isItemColumnId(columnId)) {
      setItemColumnLabels((labels) => ({ ...labels, [columnId]: header }));
    }
  }

  function updateColumnWidth(columnId: string, width: number) {
    const nextWidth = clampColumnWidth(width);
    if (activeTab === "accounting" && isAccountingColumnId(columnId)) {
      setAccountingColumnWidths((widths) => ({ ...widths, [columnId]: nextWidth }));
    } else if (activeTab === "items" && isItemColumnId(columnId)) {
      setItemColumnWidths((widths) => ({ ...widths, [columnId]: nextWidth }));
    }
  }

  function fitColumnWidth(columnId: string) {
    if (activeTab === "accounting" && isAccountingColumnId(columnId)) {
      updateColumnWidth(columnId, calculateFitWidth(accountingColumnLabels[columnId], accountingRows, columnId));
    } else if (activeTab === "items" && isItemColumnId(columnId)) {
      updateColumnWidth(columnId, calculateFitWidth(itemColumnLabels[columnId], page.values.items, columnId));
    }
  }

  function resetColumns() {
    if (activeTab === "accounting") {
      setAccountingColumnOrder([...PettyCashFundDefaultAccountingColumnIds]);
      setVisibleAccountingColumnIds([...PettyCashFundDefaultAccountingColumnIds]);
      setAccountingColumnWidths({ ...PettyCashFundAccountingColumnWidths });
      setAccountingColumnLabels({ ...PettyCashFundAccountingColumnLabels });
      return;
    }

    setItemColumnOrder([...PettyCashFundDefaultItemColumnIds]);
    setVisibleItemColumnIds([...PettyCashFundDefaultItemColumnIds]);
    setItemColumnWidths({ ...PettyCashFundItemColumnWidths });
    setItemColumnLabels({ ...PettyCashFundItemColumnLabels });
  }

  if (activeTab === "accounting") {
    return (
      <ModuleDataEntry
        title={title}
        emptyRowLabel="accounting entry"
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">Total Amount: {formatPettyCashFundAmount(page.totals.grossAmount)}</span>
        }
        columns={accountingColumns}
        columnOptions={accountingColumnOptions}
        rows={accountingRows}
        isReadonly
        canConfigureColumnsWhenReadonly={!page.isReadonly}
        onAddRows={() => undefined}
        onDuplicateRow={() => undefined}
        onInsertRow={() => undefined}
        onMoveRow={() => undefined}
        onRemoveRow={() => undefined}
        onAutoColumnWidth={fitColumnWidth}
        onFitColumnWidth={fitColumnWidth}
        onMoveColumn={moveColumn}
        onResetColumns={resetColumns}
        onToggleColumnVisibility={toggleColumnVisibility}
        onUpdateColumnHeader={updateColumnHeader}
        onUpdateColumnWidth={updateColumnWidth}
        summaryRowHeader="Totals"
        summaryCells={{
          debit: formatPettyCashFundAmount(page.totals.grossAmount),
          credit: formatPettyCashFundAmount(page.totals.grossAmount),
        }}
      />
    );
  }

  return (
    <ModuleDataEntry
      title={title}
      emptyRowLabel="petty cash item"
      error={page.errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">Total Amount: {formatPettyCashFundAmount(page.totals.amount)}</span>
      }
      columns={columns}
      columnOptions={itemColumnOptions}
      rows={page.values.items}
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addItems}
      onClearRows={() => page.updateItems([createBlankPettyCashFundItem()])}
      onDuplicateRow={page.duplicateItem}
      onInsertRow={page.insertItem}
      onMoveRow={page.moveItem}
      onRemoveRow={page.removeItem}
      onAutoColumnWidth={fitColumnWidth}
      onFitColumnWidth={fitColumnWidth}
      onMoveColumn={moveColumn}
      onResetColumns={resetColumns}
      onToggleColumnVisibility={toggleColumnVisibility}
      onUpdateColumnHeader={updateColumnHeader}
      onUpdateColumnWidth={updateColumnWidth}
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

function isAccountingColumnId(columnId: string): columnId is PettyCashFundAccountingColumnId {
  return PettyCashFundDefaultAccountingColumnIds.includes(columnId as PettyCashFundAccountingColumnId);
}

function moveColumnId<TColumnId extends string>(order: TColumnId[], fromColumnId: TColumnId, toColumnId: TColumnId) {
  const nextOrder = order.filter((columnId) => columnId !== fromColumnId);
  const targetIndex = nextOrder.indexOf(toColumnId);
  nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, fromColumnId);
  return nextOrder;
}

function updateVisibleColumnIds<TColumnId extends string>(
  visibleIds: TColumnId[],
  order: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
) {
  const nextIds = new Set(visibleIds);
  if (isVisible) nextIds.add(columnId);
  else nextIds.delete(columnId);
  return order.filter((currentColumnId) => nextIds.has(currentColumnId));
}

function calculateFitWidth<TRow, TColumnId extends keyof TRow & string>(label: string, rows: TRow[], columnId: TColumnId) {
  const longestValueLength = rows.reduce((length, row) => Math.max(length, String(row[columnId] ?? "").length), label.length);
  return clampColumnWidth(longestValueLength * 8 + 76);
}
