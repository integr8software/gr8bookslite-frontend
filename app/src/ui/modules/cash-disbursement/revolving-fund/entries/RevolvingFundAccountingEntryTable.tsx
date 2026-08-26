import { useMemo, useState } from "react";
import {
  RevolvingFundAccountingColumnLabels,
  RevolvingFundAccountingColumnWidths,
  RevolvingFundDefaultAccountingColumnIds,
  RevolvingFundProtectedAccountingColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import {
  calculateRevolvingFundTotals,
  formatRevolvingFundAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import type {
  RevolvingFundAccountingColumnId,
  RevolvingFundAccountingEntry,
  RevolvingFundAccountingEntryTableProps,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { createRevolvingFundAccountingColumns } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { formatAmount } from "@/app/src/utils/currency.util";

export function RevolvingFundAccountingEntryTable({ page }: RevolvingFundAccountingEntryTableProps) {
  const accountingRows = useMemo<RevolvingFundAccountingEntry[]>(() => {
    const total = calculateRevolvingFundTotals(page.values.items).amount;
    return [
      {
        id: "rf-accounting-debit",
        accountCode: page.values.accountCode,
        accountTitle: page.values.accountTitle,
        debit: formatRevolvingFundAmount(total),
        credit: "0.00",
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: page.values.remarks,
      },
      {
        id: "rf-accounting-credit",
        accountCode: "101-200",
        accountTitle: "Petty Cash Fund",
        debit: "0.00",
        credit: formatRevolvingFundAmount(total),
        partyCode: page.values.partyCode,
        partyName: page.values.partyName,
        remarks: page.values.remarks,
      },
    ];
  }, [
    page.values.accountCode,
    page.values.accountTitle,
    page.values.items,
    page.values.partyCode,
    page.values.partyName,
    page.values.remarks,
  ]);

  const totalAmount = calculateRevolvingFundTotals(page.values.items).amount;

  const [columnOrder, setColumnOrder] = useState<RevolvingFundAccountingColumnId[]>([
    ...RevolvingFundDefaultAccountingColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<RevolvingFundAccountingColumnId[]>([
    ...RevolvingFundDefaultAccountingColumnIds,
  ]);
  const [columnWidths, setColumnWidths] = useState({ ...RevolvingFundAccountingColumnWidths });
  const [columnLabels, setColumnLabels] = useState({ ...RevolvingFundAccountingColumnLabels });

  const allColumns = useMemo(
    () => createRevolvingFundAccountingColumns(columnLabels, columnWidths),
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
        RevolvingFundProtectedAccountingColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isAccountingColumnId(fromId) && isAccountingColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isAccountingColumnId(columnId) && (!isVisible && RevolvingFundProtectedAccountingColumnIds.has(columnId))) {
      return;
    }
    if (isAccountingColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isAccountingColumnId(columnId)) {
      setColumnLabels((labels) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isAccountingColumnId(columnId)) {
      setColumnWidths((widths) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isAccountingColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], accountingRows, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...RevolvingFundDefaultAccountingColumnIds]);
    setVisibleColumnIds([...RevolvingFundDefaultAccountingColumnIds]);
    setColumnWidths({ ...RevolvingFundAccountingColumnWidths });
    setColumnLabels({ ...RevolvingFundAccountingColumnLabels });
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
        debit: formatAmount(totalAmount),
        credit: formatAmount(totalAmount),
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

function isAccountingColumnId(columnId: string): columnId is RevolvingFundAccountingColumnId {
  return RevolvingFundDefaultAccountingColumnIds.includes(columnId as RevolvingFundAccountingColumnId);
}
