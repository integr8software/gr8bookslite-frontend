import { useMemo, useState } from "react";
import {
  RevolvingFundAccountingColumnLabels,
  RevolvingFundAccountingColumnWidths,
  RevolvingFundDefaultAccountingColumnIds,
  RevolvingFundDefaultItemColumnIds,
  RevolvingFundItemColumnLabels,
  RevolvingFundItemColumnWidths,
  RevolvingFundProtectedAccountingColumnIds,
  RevolvingFundProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import {
  createBlankRevolvingFundItem,
  formatRevolvingFundAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import type { RevolvingFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
import type {
  RevolvingFundAccountingColumnId,
  RevolvingFundAccountingEntry,
  RevolvingFundEntryTab,
  RevolvingFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { RevolvingFundEntryTabs } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundEntryTabs";
import {
  createRevolvingFundAccountingColumns,
  createRevolvingFundItemColumns,
} from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundLineColumns";
import { ModuleDataEntry, type ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

const AccountingEntryTab: RevolvingFundEntryTab = "accounting";

export function RevolvingFundEntrySection({ page }: { page: RevolvingFundActionPageState }) {
  const [activeTab, setActiveTab] = useState<RevolvingFundEntryTab>("items");
  const [itemColumnOrder, setItemColumnOrder] = useState<RevolvingFundItemColumnId[]>([...RevolvingFundDefaultItemColumnIds]);
  const [visibleItemColumnIds, setVisibleItemColumnIds] = useState<RevolvingFundItemColumnId[]>([...RevolvingFundDefaultItemColumnIds]);
  const [itemColumnWidths, setItemColumnWidths] = useState({ ...RevolvingFundItemColumnWidths });
  const [itemColumnLabels, setItemColumnLabels] = useState({ ...RevolvingFundItemColumnLabels });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<RevolvingFundAccountingColumnId[]>([
    ...RevolvingFundDefaultAccountingColumnIds,
  ]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<RevolvingFundAccountingColumnId[]>([
    ...RevolvingFundDefaultAccountingColumnIds,
  ]);
  const [accountingColumnWidths, setAccountingColumnWidths] = useState({ ...RevolvingFundAccountingColumnWidths });
  const [accountingColumnLabels, setAccountingColumnLabels] = useState({ ...RevolvingFundAccountingColumnLabels });
  const allItemColumns = useMemo(
    () => createRevolvingFundItemColumns(page, itemColumnLabels, itemColumnWidths),
    [itemColumnLabels, itemColumnWidths, page],
  );
  const columns = itemColumnOrder.filter((columnId) => visibleItemColumnIds.includes(columnId)).map((columnId) => allItemColumns[columnId]);
  const accountingRows = useMemo<RevolvingFundAccountingEntry[]>(() => {
    const total = page.totals.grossAmount;
    return [
      {
        id: "rf-accounting-debit",
        accountCode: page.values.accountCode,
        accountTitle: page.values.accountTitle,
        debit: formatRevolvingFundAmount(total),
        credit: "0.00",
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        particulars: page.values.remarks,
      },
      {
        id: "rf-accounting-credit",
        accountCode: "101-100",
        accountTitle: "Cash in Bank",
        debit: "0.00",
        credit: formatRevolvingFundAmount(total),
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
    () => createRevolvingFundAccountingColumns(accountingColumnLabels, accountingColumnWidths),
    [accountingColumnLabels, accountingColumnWidths],
  );
  const accountingColumns = accountingColumnOrder
    .filter((columnId) => visibleAccountingColumnIds.includes(columnId))
    .map((columnId) => allAccountingColumns[columnId]);
  const itemColumnOptions: ModuleDataEntryColumnOption[] = itemColumnOrder.map((columnId) => ({
    id: columnId,
    label: itemColumnLabels[columnId],
    isVisible: visibleItemColumnIds.includes(columnId),
    isHideable: !RevolvingFundProtectedItemColumnIds.has(columnId),
    width: itemColumnWidths[columnId],
    widthMode: "fixed",
  }));
  const accountingColumnOptions: ModuleDataEntryColumnOption[] = accountingColumnOrder.map((columnId) => ({
    id: columnId,
    label: accountingColumnLabels[columnId],
    isVisible: visibleAccountingColumnIds.includes(columnId),
    isHideable: !RevolvingFundProtectedAccountingColumnIds.has(columnId),
    width: accountingColumnWidths[columnId],
    widthMode: "fixed",
  }));
  const title = <RevolvingFundEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />;

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (activeTab === AccountingEntryTab) {
      if (!isAccountingColumnId(fromColumnId) || !isAccountingColumnId(toColumnId)) return;
      setAccountingColumnOrder((order) => moveColumnId(order, fromColumnId, toColumnId));
      return;
    }

    if (!isItemColumnId(fromColumnId) || !isItemColumnId(toColumnId)) return;
    setItemColumnOrder((order) => moveColumnId(order, fromColumnId, toColumnId));
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (activeTab === AccountingEntryTab) {
      if (!isAccountingColumnId(columnId) || (!isVisible && RevolvingFundProtectedAccountingColumnIds.has(columnId))) return;
      setVisibleAccountingColumnIds((ids) => updateVisibleColumnIds(ids, accountingColumnOrder, columnId, isVisible));
      return;
    }

    if (!isItemColumnId(columnId) || (!isVisible && RevolvingFundProtectedItemColumnIds.has(columnId))) return;
    setVisibleItemColumnIds((ids) => updateVisibleColumnIds(ids, itemColumnOrder, columnId, isVisible));
  }

  function updateColumnHeader(columnId: string, header: string) {
    if (activeTab === AccountingEntryTab && isAccountingColumnId(columnId)) {
      setAccountingColumnLabels((labels) => ({ ...labels, [columnId]: header }));
    } else if (activeTab === "items" && isItemColumnId(columnId)) {
      setItemColumnLabels((labels) => ({ ...labels, [columnId]: header }));
    }
  }

  function updateColumnWidth(columnId: string, width: number) {
    const nextWidth = clampColumnWidth(width);
    if (activeTab === AccountingEntryTab && isAccountingColumnId(columnId)) {
      setAccountingColumnWidths((widths) => ({ ...widths, [columnId]: nextWidth }));
    } else if (activeTab === "items" && isItemColumnId(columnId)) {
      setItemColumnWidths((widths) => ({ ...widths, [columnId]: nextWidth }));
    }
  }

  function fitColumnWidth(columnId: string) {
    if (activeTab === AccountingEntryTab && isAccountingColumnId(columnId)) {
      updateColumnWidth(columnId, calculateFitWidth(accountingColumnLabels[columnId], accountingRows, columnId));
    } else if (activeTab === "items" && isItemColumnId(columnId)) {
      updateColumnWidth(columnId, calculateFitWidth(itemColumnLabels[columnId], page.values.items, columnId));
    }
  }

  function resetColumns() {
    if (activeTab === AccountingEntryTab) {
      setAccountingColumnOrder([...RevolvingFundDefaultAccountingColumnIds]);
      setVisibleAccountingColumnIds([...RevolvingFundDefaultAccountingColumnIds]);
      setAccountingColumnWidths({ ...RevolvingFundAccountingColumnWidths });
      setAccountingColumnLabels({ ...RevolvingFundAccountingColumnLabels });
      return;
    }

    setItemColumnOrder([...RevolvingFundDefaultItemColumnIds]);
    setVisibleItemColumnIds([...RevolvingFundDefaultItemColumnIds]);
    setItemColumnWidths({ ...RevolvingFundItemColumnWidths });
    setItemColumnLabels({ ...RevolvingFundItemColumnLabels });
  }

  if (activeTab === AccountingEntryTab) {
    return (
      <ModuleDataEntry
        title={title}
        emptyRowLabel="accounting entry"
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">Total Amount: {formatRevolvingFundAmount(page.totals.grossAmount)}</span>
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
          debit: formatRevolvingFundAmount(page.totals.grossAmount),
          credit: formatRevolvingFundAmount(page.totals.grossAmount),
        }}
      />
    );
  }

  return (
    <ModuleDataEntry
      title={title}
      emptyRowLabel="revolving fund item"
      error={page.errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">Total Amount: {formatRevolvingFundAmount(page.totals.amount)}</span>
      }
      columns={columns}
      columnOptions={itemColumnOptions}
      rows={page.values.items}
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addItems}
      onClearRows={() => page.updateItems([createBlankRevolvingFundItem()])}
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

function isAccountingColumnId(columnId: string): columnId is RevolvingFundAccountingColumnId {
  return RevolvingFundDefaultAccountingColumnIds.includes(columnId as RevolvingFundAccountingColumnId);
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
