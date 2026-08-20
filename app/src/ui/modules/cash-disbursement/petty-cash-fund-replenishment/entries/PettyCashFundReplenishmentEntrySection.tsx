import { useMemo, useState } from "react";
import {
  PettyCashFundReplenishmentAccountingColumnLabels,
  PettyCashFundReplenishmentAccountingColumnOrder,
  PettyCashFundReplenishmentAccountingColumnWidths,
  PettyCashFundReplenishmentEntryColumnLabels,
  PettyCashFundReplenishmentEntryColumnOrder,
  PettyCashFundReplenishmentEntryColumnWidths,
  PettyCashFundReplenishmentProtectedEntryColumnIds,
  PettyCashFundReplenishmentProtectedAccountingColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import {
  createBlankPettyCashFundReplenishmentEntry,
  formatPettyCashFundReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import type { PettyCashFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import type {
  PettyCashFundReplenishmentAccountingColumnId,
  PettyCashFundReplenishmentAccountingEntry,
  PettyCashFundReplenishmentEntryColumnId,
  PettyCashFundReplenishmentEntryTab,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { PettyCashFundReplenishmentEntryTabs } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentEntryTabs";
import {
  createPettyCashFundReplenishmentAccountingColumns,
  createPettyCashFundReplenishmentLineColumns,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentLineColumns";
import { ModuleDataEntry, type ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { parseFiniteNumber } from "@/app/src/utils/number.util";

export function PettyCashFundReplenishmentEntrySection({ page }: { page: PettyCashFundReplenishmentActionPageState }) {
  const [activeEntryTab, setActiveEntryTab] = useState<PettyCashFundReplenishmentEntryTab>("vouchers");
  const [columnOrder, setColumnOrder] = useState([...PettyCashFundReplenishmentEntryColumnOrder]);
  const [visibleColumnIds, setVisibleColumnIds] = useState([...PettyCashFundReplenishmentEntryColumnOrder]);
  const [columnWidths, setColumnWidths] = useState({
    ...PettyCashFundReplenishmentEntryColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState({
    ...PettyCashFundReplenishmentEntryColumnLabels,
  });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState([...PettyCashFundReplenishmentAccountingColumnOrder]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState([...PettyCashFundReplenishmentAccountingColumnOrder]);
  const [accountingColumnWidths, setAccountingColumnWidths] = useState({
    ...PettyCashFundReplenishmentAccountingColumnWidths,
  });
  const [accountingColumnLabels, setAccountingColumnLabels] = useState({
    ...PettyCashFundReplenishmentAccountingColumnLabels,
  });
  const allColumns = useMemo(
    () =>
      createPettyCashFundReplenishmentLineColumns({
        columnLabels,
        columnWidths,
        page,
      }),
    [columnLabels, columnWidths, page],
  );
  const columns = useMemo(
    () => columnOrder.filter((columnId) => visibleColumnIds.includes(columnId)).map((columnId) => allColumns[columnId]),
    [allColumns, columnOrder, visibleColumnIds],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !PettyCashFundReplenishmentProtectedEntryColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: columnLabels[columnId],
        width: columnWidths[columnId],
        widthMode: "fixed",
      })),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );
  const accountingRows = useMemo<PettyCashFundReplenishmentAccountingEntry[]>(
    () => [
      ...page.values.entries.map((entry) => ({
        id: `pcfr-accounting-debit-${entry.id}`,
        accountCode: entry.accountCode,
        accountTitle: entry.accountTitle,
        debit: formatPettyCashFundReplenishmentAmount(parseFiniteNumber(entry.totalAmount)),
        credit: "0.00",
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: entry.remarks,
      })),
      {
        id: "pcfr-accounting-credit",
        accountCode: page.values.accountCode,
        accountTitle: page.values.accountTitle,
        debit: "0.00",
        credit: formatPettyCashFundReplenishmentAmount(page.totals.totalAmount),
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: page.values.remarks,
      },
    ],
    [
      page.totals.totalAmount,
      page.values.accountCode,
      page.values.accountTitle,
      page.values.entries,
      page.values.partyCode,
      page.values.partyName,
      page.values.remarks,
    ],
  );
  const allAccountingColumns = useMemo(
    () =>
      createPettyCashFundReplenishmentAccountingColumns({
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
    isHideable: !PettyCashFundReplenishmentProtectedAccountingColumnIds.has(columnId),
    isVisible: visibleAccountingColumnIds.includes(columnId),
    label: accountingColumnLabels[columnId],
    width: accountingColumnWidths[columnId],
    widthMode: "fixed" as const,
  }));
  const entryTabs = <PettyCashFundReplenishmentEntryTabs activeTab={activeEntryTab} onTabChange={setActiveEntryTab} />;

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
    if (!isEntryColumnId(columnId) || (!isVisible && PettyCashFundReplenishmentProtectedEntryColumnIds.has(columnId))) {
      return;
    }

    setVisibleColumnIds((currentIds) =>
      isVisible
        ? columnOrder.filter((currentColumnId) => currentIds.includes(currentColumnId) || currentColumnId === columnId)
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

    const values = [columnLabels[columnId], ...page.values.entries.map((entry) => String(entry[columnId] ?? ""))];
    updateColumnWidth(columnId, Math.max(...values.map((value) => value.trim().length * 7.5 + 76)));
  }

  function resetColumns() {
    setColumnOrder([...PettyCashFundReplenishmentEntryColumnOrder]);
    setVisibleColumnIds([...PettyCashFundReplenishmentEntryColumnOrder]);
    setColumnWidths({ ...PettyCashFundReplenishmentEntryColumnWidths });
    setColumnLabels({ ...PettyCashFundReplenishmentEntryColumnLabels });
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
    if (!isAccountingColumnId(columnId) || (!isVisible && PettyCashFundReplenishmentProtectedAccountingColumnIds.has(columnId))) return;
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
    const values = [accountingColumnLabels[columnId], ...accountingRows.map((entry) => String(entry[columnId] ?? ""))];
    updateAccountingColumnWidth(columnId, Math.max(...values.map((value) => value.trim().length * 7.5 + 76)));
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...PettyCashFundReplenishmentAccountingColumnOrder]);
    setVisibleAccountingColumnIds([...PettyCashFundReplenishmentAccountingColumnOrder]);
    setAccountingColumnWidths({ ...PettyCashFundReplenishmentAccountingColumnWidths });
    setAccountingColumnLabels({ ...PettyCashFundReplenishmentAccountingColumnLabels });
  }

  if (activeEntryTab === "accounting") {
    return (
      <ModuleDataEntry
        title={entryTabs}
        emptyRowLabel="accounting entry"
        footerDetails={
          <span className="text-sm font-semibold text-darknavy">
            Total Amount: {formatPettyCashFundReplenishmentAmount(page.totals.totalAmount)}
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
          debit: formatPettyCashFundReplenishmentAmount(page.totals.totalAmount),
          credit: formatPettyCashFundReplenishmentAmount(page.totals.totalAmount),
        }}
      />
    );
  }

  return (
    <ModuleDataEntry
      title={entryTabs}
      emptyRowLabel="petty cash voucher"
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
      onAutoColumnWidth={fitColumnWidth}
      onClearRows={() => page.updateEntries([createBlankPettyCashFundReplenishmentEntry()])}
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
        totalAmount: formatPettyCashFundReplenishmentAmount(page.totals.totalAmount),
        netAmount: formatPettyCashFundReplenishmentAmount(page.totals.netAmount),
        vatAmount: formatPettyCashFundReplenishmentAmount(page.totals.vatAmount),
      }}
    />
  );
}

function isEntryColumnId(columnId: string): columnId is PettyCashFundReplenishmentEntryColumnId {
  return PettyCashFundReplenishmentEntryColumnOrder.includes(columnId as PettyCashFundReplenishmentEntryColumnId);
}

function isAccountingColumnId(columnId: string): columnId is PettyCashFundReplenishmentAccountingColumnId {
  return PettyCashFundReplenishmentAccountingColumnOrder.includes(columnId as PettyCashFundReplenishmentAccountingColumnId);
}
