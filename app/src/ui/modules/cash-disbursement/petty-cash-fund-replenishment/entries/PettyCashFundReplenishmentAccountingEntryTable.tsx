import { useMemo, useState } from "react";
import {
  PettyCashFundReplenishmentAccountingColumnLabels,
  PettyCashFundReplenishmentAccountingColumnOrder,
  PettyCashFundReplenishmentAccountingColumnWidths,
  PettyCashFundReplenishmentProtectedAccountingColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { formatPettyCashFundReplenishmentAmount } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  PettyCashFundReplenishmentAccountingColumnId,
  PettyCashFundReplenishmentAccountingEntry,
  PettyCashFundReplenishmentAccountingEntryTableProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
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

export function PettyCashFundReplenishmentAccountingEntryTable({
  page,
}: PettyCashFundReplenishmentAccountingEntryTableProps) {
  const accountingRows = useMemo<PettyCashFundReplenishmentAccountingEntry[]>(
    () => [
      ...page.values.entries.map((entry, index) => ({
        id: `pcfr-accounting-entry-${index}`,
        accountCode: entry.accountCode,
        accountTitle: entry.accountTitle,
        debit: formatPettyCashFundReplenishmentAmount(parseMoneyNumberInput(entry.totalAmount)),
        credit: "0.00",
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: entry.remarks,
      })),
      {
        id: "pcfr-accounting-credit",
        accountCode: "101-200",
        accountTitle: "Petty Cash Fund",
        debit: "0.00",
        credit: formatPettyCashFundReplenishmentAmount(page.totals.totalAmount),
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: page.values.remarks,
      },
    ],
    [page.values.entries, page.values.partyCode, page.values.partyName, page.values.remarks, page.totals.totalAmount],
  );

  const [columnOrder, setColumnOrder] = useState<PettyCashFundReplenishmentAccountingColumnId[]>([
    ...PettyCashFundReplenishmentAccountingColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<PettyCashFundReplenishmentAccountingColumnId[]>([
    ...PettyCashFundReplenishmentAccountingColumnOrder,
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<PettyCashFundReplenishmentAccountingColumnId, number>>({
    ...PettyCashFundReplenishmentAccountingColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState<Record<PettyCashFundReplenishmentAccountingColumnId, string>>({
    ...PettyCashFundReplenishmentAccountingColumnLabels,
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
        PettyCashFundReplenishmentProtectedAccountingColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isAccountingColumnId(fromId) && isAccountingColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isAccountingColumnId(columnId) && (!isVisible && PettyCashFundReplenishmentProtectedAccountingColumnIds.has(columnId))) {
      return;
    }
    if (isAccountingColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isAccountingColumnId(columnId)) {
      setColumnLabels((labels: Record<PettyCashFundReplenishmentAccountingColumnId, string>) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isAccountingColumnId(columnId)) {
      setColumnWidths((widths: Record<PettyCashFundReplenishmentAccountingColumnId, number>) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isAccountingColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], accountingRows, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...PettyCashFundReplenishmentAccountingColumnOrder]);
    setVisibleColumnIds([...PettyCashFundReplenishmentAccountingColumnOrder]);
    setColumnWidths({ ...PettyCashFundReplenishmentAccountingColumnWidths });
    setColumnLabels({ ...PettyCashFundReplenishmentAccountingColumnLabels });
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

function isAccountingColumnId(columnId: string): columnId is PettyCashFundReplenishmentAccountingColumnId {
  return PettyCashFundReplenishmentAccountingColumnOrder.includes(
    columnId as PettyCashFundReplenishmentAccountingColumnId,
  );
}
