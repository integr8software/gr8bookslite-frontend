import { useMemo, useState } from "react";
import {
  RevolvingFundReplenishmentAccountingColumnLabels,
  RevolvingFundReplenishmentAccountingColumnOrder,
  RevolvingFundReplenishmentAccountingColumnWidths,
  RevolvingFundReplenishmentProtectedAccountingColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { formatRevolvingFundReplenishmentAmount } from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  RevolvingFundReplenishmentAccountingColumnId,
  RevolvingFundReplenishmentAccountingEntry,
  RevolvingFundReplenishmentAccountingEntryTableProps,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { createPettyCashFundReplenishmentAccountingColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { formatAmount } from "@/app/src/utils/currency.util";

export function RevolvingFundReplenishmentAccountingEntryTable({
  page,
}: RevolvingFundReplenishmentAccountingEntryTableProps) {
  const accountingRows = useMemo<RevolvingFundReplenishmentAccountingEntry[]>(
    () => [
      ...page.values.entries.map((entry, index) => ({
        id: `rfr-accounting-entry-${index}`,
        accountCode: entry.accountCode,
        accountTitle: entry.accountTitle,
        debit: formatRevolvingFundReplenishmentAmount(parseMoneyNumberInput(entry.totalAmount)),
        credit: "0.00",
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: entry.remarks,
      })),
      {
        id: "rfr-accounting-credit",
        accountCode: "101-200",
        accountTitle: "Petty Cash Fund",
        debit: "0.00",
        credit: formatRevolvingFundReplenishmentAmount(page.totals.totalAmount),
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: page.values.remarks,
      },
    ],
    [page.values.entries, page.values.partyCode, page.values.partyName, page.values.remarks, page.totals.totalAmount],
  );

  const [columnOrder, setColumnOrder] = useState<RevolvingFundReplenishmentAccountingColumnId[]>([
    ...RevolvingFundReplenishmentAccountingColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<RevolvingFundReplenishmentAccountingColumnId[]>([
    ...RevolvingFundReplenishmentAccountingColumnOrder,
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<RevolvingFundReplenishmentAccountingColumnId, number>>({
    ...RevolvingFundReplenishmentAccountingColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState<Record<RevolvingFundReplenishmentAccountingColumnId, string>>({
    ...RevolvingFundReplenishmentAccountingColumnLabels,
  });

  const allColumns = useMemo(
    () => createPettyCashFundReplenishmentAccountingColumns({ columnLabels, columnWidths }),
    [columnLabels, columnWidths],
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
        RevolvingFundReplenishmentProtectedAccountingColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isAccountingColumnId(fromId) && isAccountingColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isAccountingColumnId(columnId) && (!isVisible && RevolvingFundReplenishmentProtectedAccountingColumnIds.has(columnId))) {
      return;
    }
    if (isAccountingColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isAccountingColumnId(columnId)) {
      setColumnLabels((labels: Record<RevolvingFundReplenishmentAccountingColumnId, string>) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isAccountingColumnId(columnId)) {
      setColumnWidths((widths: Record<RevolvingFundReplenishmentAccountingColumnId, number>) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isAccountingColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], accountingRows, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...RevolvingFundReplenishmentAccountingColumnOrder]);
    setVisibleColumnIds([...RevolvingFundReplenishmentAccountingColumnOrder]);
    setColumnWidths({ ...RevolvingFundReplenishmentAccountingColumnWidths });
    setColumnLabels({ ...RevolvingFundReplenishmentAccountingColumnLabels });
  }

  return (
    <ModuleDataEntry
      title=""
      emptyRowLabel="accounting entry"
      error={undefined}
      footerDetails={
        <span className="text-sm font-semibold text-emerald-700">
          Variance: 0.00
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={accountingRows}
      isDraggable={false}
      isReadonly
      summaryRowHeader="Totals"
      summaryCells={{
        debit: formatAmount(page.totals.totalAmount),
        credit: formatAmount(page.totals.totalAmount),
      }}
      onAddRows={() => {}}
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
    />
  );
}

function isAccountingColumnId(columnId: string): columnId is RevolvingFundReplenishmentAccountingColumnId {
  return RevolvingFundReplenishmentAccountingColumnOrder.includes(
    columnId as RevolvingFundReplenishmentAccountingColumnId,
  );
}
