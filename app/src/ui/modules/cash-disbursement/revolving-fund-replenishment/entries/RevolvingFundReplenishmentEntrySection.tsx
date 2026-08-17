import { useMemo, useState } from "react";
import {
  RevolvingFundReplenishmentAccountingColumnLabels,
  RevolvingFundReplenishmentAccountingColumnOrder,
  RevolvingFundReplenishmentAccountingColumnWidths,
  RevolvingFundReplenishmentEntryColumnLabels,
  RevolvingFundReplenishmentEntryColumnOrder,
  RevolvingFundReplenishmentEntryColumnWidths,
  RevolvingFundReplenishmentProtectedEntryColumnIds,
  RevolvingFundReplenishmentProtectedAccountingColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { createBlankRevolvingFundReplenishmentEntry, formatRevolvingFundReplenishmentAmount } from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentActionPage";
import type {
  RevolvingFundReplenishmentAccountingColumnId,
  RevolvingFundReplenishmentAccountingEntry,
  RevolvingFundReplenishmentEntryColumnId,
  RevolvingFundReplenishmentEntryTab,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentEntryTabs } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentEntryTabs";
import {
  createRevolvingFundReplenishmentAccountingColumns,
  createRevolvingFundReplenishmentLineColumns,
} from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentLineColumns";
import { ModuleDataEntry, type ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { parseFiniteNumber } from "@/app/src/utils/number.util";

export function RevolvingFundReplenishmentEntrySection({ page }: { page: RevolvingFundReplenishmentActionPageState }) {
  const [activeEntryTab, setActiveEntryTab] = useState<RevolvingFundReplenishmentEntryTab>("vouchers");
  const [columnOrder, setColumnOrder] = useState([
    ...RevolvingFundReplenishmentEntryColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState([
    ...RevolvingFundReplenishmentEntryColumnOrder,
  ]);
  const [columnWidths, setColumnWidths] = useState({
    ...RevolvingFundReplenishmentEntryColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState({
    ...RevolvingFundReplenishmentEntryColumnLabels,
  });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState([
    ...RevolvingFundReplenishmentAccountingColumnOrder,
  ]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState([
    ...RevolvingFundReplenishmentAccountingColumnOrder,
  ]);
  const [accountingColumnWidths, setAccountingColumnWidths] = useState({
    ...RevolvingFundReplenishmentAccountingColumnWidths,
  });
  const [accountingColumnLabels, setAccountingColumnLabels] = useState({
    ...RevolvingFundReplenishmentAccountingColumnLabels,
  });
  const allColumns = useMemo(
    () =>
      createRevolvingFundReplenishmentLineColumns({
        columnLabels,
        columnWidths,
        page,
      }),
    [columnLabels, columnWidths, page],
  );
  const columns = useMemo(
    () =>
      columnOrder
        .filter((columnId) => visibleColumnIds.includes(columnId))
        .map((columnId) => allColumns[columnId]),
    [allColumns, columnOrder, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !RevolvingFundReplenishmentProtectedEntryColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: columnLabels[columnId],
        width: columnWidths[columnId],
        widthMode: "fixed",
      })),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );
  const accountingRows = useMemo<RevolvingFundReplenishmentAccountingEntry[]>(() => [
    ...page.values.entries.map((entry) => ({
      id: `rfr-accounting-debit-${entry.id}`,
      accountCode: entry.accountCode,
      accountTitle: entry.accountTitle,
      debit: formatRevolvingFundReplenishmentAmount(parseFiniteNumber(entry.totalAmount)),
      credit: "0.00",
      partyCode: page.values.partyCode,
      partyName: page.values.partyName,
      particulars: entry.remarks,
    })),
    {
      id: "rfr-accounting-credit",
      accountCode: page.values.accountCode,
      accountTitle: page.values.accountTitle,
      debit: "0.00",
      credit: formatRevolvingFundReplenishmentAmount(page.totals.totalAmount),
      partyCode: page.values.partyCode,
      partyName: page.values.partyName,
      particulars: page.values.remarks,
    },
  ], [page.totals.totalAmount, page.values.accountCode, page.values.accountTitle, page.values.entries, page.values.partyCode, page.values.partyName, page.values.remarks]);
  const allAccountingColumns = useMemo(
    () => createRevolvingFundReplenishmentAccountingColumns({
      columnLabels: accountingColumnLabels,
      columnWidths: accountingColumnWidths,
    }),
    [accountingColumnLabels, accountingColumnWidths],
  );
  const accountingColumns = accountingColumnOrder
    .filter((columnId) => visibleAccountingColumnIds.includes(columnId))
    .map((columnId) => allAccountingColumns[columnId]);
  const accountingColumnOptions = accountingColumnOrder.map((columnId) => ({
    id: columnId,
    isHideable: !RevolvingFundReplenishmentProtectedAccountingColumnIds.has(columnId),
    isVisible: visibleAccountingColumnIds.includes(columnId),
    label: accountingColumnLabels[columnId],
    width: accountingColumnWidths[columnId],
    widthMode: "fixed" as const,
  }));
  const entryTabs = <RevolvingFundReplenishmentEntryTabs activeTab={activeEntryTab} onTabChange={setActiveEntryTab} />;

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (!isEntryColumnId(fromColumnId) || !isEntryColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) => {
      const fromIndex = currentOrder.indexOf(fromColumnId);
      const toIndex = currentOrder.indexOf(toColumnId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      const [movedColumn] = nextOrder.splice(fromIndex, 1);
      nextOrder.splice(toIndex, 0, movedColumn);
      return nextOrder;
    });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (
      !isEntryColumnId(columnId) ||
      (!isVisible && RevolvingFundReplenishmentProtectedEntryColumnIds.has(columnId))
    ) {
      return;
    }

    setVisibleColumnIds((currentIds) =>
      isVisible
        ? columnOrder.filter(
            (currentColumnId) =>
              currentIds.includes(currentColumnId) || currentColumnId === columnId,
          )
        : currentIds.filter((currentColumnId) => currentColumnId !== columnId),
    );
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isEntryColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (!isEntryColumnId(columnId)) {
      return;
    }

    const values = [
      columnLabels[columnId],
      ...page.values.entries.map((entry) => String(entry[columnId] ?? "")),
    ];
    updateColumnWidth(
      columnId,
      Math.max(...values.map((value) => value.trim().length * 7.5 + 76)),
    );
  }

  function resetColumns() {
    setColumnOrder([...RevolvingFundReplenishmentEntryColumnOrder]);
    setVisibleColumnIds([...RevolvingFundReplenishmentEntryColumnOrder]);
    setColumnWidths({ ...RevolvingFundReplenishmentEntryColumnWidths });
    setColumnLabels({ ...RevolvingFundReplenishmentEntryColumnLabels });
  }

  function moveAccountingColumn(fromColumnId: string, toColumnId: string) {
    if (!isAccountingColumnId(fromColumnId) || !isAccountingColumnId(toColumnId)) return;
    setAccountingColumnOrder((currentOrder) => {
      const nextOrder = currentOrder.filter((columnId) => columnId !== fromColumnId);
      const targetIndex = nextOrder.indexOf(toColumnId);
      nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, fromColumnId);
      return nextOrder;
    });
  }

  function toggleAccountingColumnVisibility(columnId: string, isVisible: boolean) {
    if (
      !isAccountingColumnId(columnId) ||
      (!isVisible && RevolvingFundReplenishmentProtectedAccountingColumnIds.has(columnId))
    ) return;
    setVisibleAccountingColumnIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (isVisible) nextIds.add(columnId);
      else nextIds.delete(columnId);
      return accountingColumnOrder.filter((currentColumnId) => nextIds.has(currentColumnId));
    });
  }

  function updateAccountingColumnWidth(columnId: string, width: number) {
    if (!isAccountingColumnId(columnId)) return;
    setAccountingColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitAccountingColumnWidth(columnId: string) {
    if (!isAccountingColumnId(columnId)) return;
    const values = [
      accountingColumnLabels[columnId],
      ...accountingRows.map((entry) => String(entry[columnId] ?? "")),
    ];
    updateAccountingColumnWidth(columnId, Math.max(...values.map((value) => value.trim().length * 7.5 + 76)));
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...RevolvingFundReplenishmentAccountingColumnOrder]);
    setVisibleAccountingColumnIds([...RevolvingFundReplenishmentAccountingColumnOrder]);
    setAccountingColumnWidths({ ...RevolvingFundReplenishmentAccountingColumnWidths });
    setAccountingColumnLabels({ ...RevolvingFundReplenishmentAccountingColumnLabels });
  }

  if (activeEntryTab === "accounting") {
    return (
      <ModuleDataEntry
        title={entryTabs}
        emptyRowLabel="accounting entry"
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">
            Total Amount: {formatRevolvingFundReplenishmentAmount(page.totals.totalAmount)}
          </span>
        }
        columns={accountingColumns}
        columnOptions={accountingColumnOptions}
        rows={accountingRows}
        isReadonly
        canConfigureColumnsWhenReadonly={!page.isReadonly}
        onAddRows={() => undefined}
        onAutoColumnWidth={fitAccountingColumnWidth}
        onDuplicateRow={() => undefined}
        onFitColumnWidth={fitAccountingColumnWidth}
        onInsertRow={() => undefined}
        onMoveColumn={moveAccountingColumn}
        onMoveRow={() => undefined}
        onRemoveRow={() => undefined}
        onResetColumns={resetAccountingColumns}
        onToggleColumnVisibility={toggleAccountingColumnVisibility}
        onUpdateColumnHeader={(columnId, header) => {
          if (isAccountingColumnId(columnId)) {
            setAccountingColumnLabels((currentLabels) => ({ ...currentLabels, [columnId]: header }));
          }
        }}
        onUpdateColumnWidth={updateAccountingColumnWidth}
        summaryRowHeader="Totals"
        summaryCells={{
          debit: formatRevolvingFundReplenishmentAmount(page.totals.totalAmount),
          credit: formatRevolvingFundReplenishmentAmount(page.totals.totalAmount),
        }}
      />
    );
  }

  return (
    <ModuleDataEntry
      title={entryTabs}
      emptyRowLabel="revolving fund voucher"
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
      onAutoColumnWidth={fitColumnWidth}
      onClearRows={() =>
        page.updateEntries([createBlankRevolvingFundReplenishmentEntry()])
      }
      onDuplicateRow={page.duplicateEntry}
      onFitColumnWidth={fitColumnWidth}
      onInsertRow={page.insertEntry}
      onMoveColumn={moveColumn}
      onMoveRow={page.moveEntry}
      onRemoveRow={page.removeEntry}
      onResetColumns={resetColumns}
      onToggleColumnVisibility={toggleColumnVisibility}
      onUpdateColumnHeader={(columnId, header) => {
        if (isEntryColumnId(columnId)) {
          setColumnLabels((currentLabels) => ({
            ...currentLabels,
            [columnId]: header,
          }));
        }
      }}
      onUpdateColumnWidth={updateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        totalAmount: formatRevolvingFundReplenishmentAmount(page.totals.totalAmount),
        netAmount: formatRevolvingFundReplenishmentAmount(page.totals.netAmount),
        vatAmount: formatRevolvingFundReplenishmentAmount(page.totals.vatAmount),
      }}
    />
  );
}

function isEntryColumnId(
  columnId: string,
): columnId is RevolvingFundReplenishmentEntryColumnId {
  return RevolvingFundReplenishmentEntryColumnOrder.includes(
    columnId as RevolvingFundReplenishmentEntryColumnId,
  );
}

function isAccountingColumnId(
  columnId: string,
): columnId is RevolvingFundReplenishmentAccountingColumnId {
  return RevolvingFundReplenishmentAccountingColumnOrder.includes(
    columnId as RevolvingFundReplenishmentAccountingColumnId,
  );
}

