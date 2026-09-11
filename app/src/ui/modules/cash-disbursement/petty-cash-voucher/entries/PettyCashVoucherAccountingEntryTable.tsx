import { useMemo } from "react";
import {
  PettyCashVoucherAccountingColumnLabels,
  PettyCashVoucherAccountingColumnWidths,
  PettyCashVoucherAccountingTablePreferencesStorageKey,
  PettyCashVoucherDefaultAccountingColumnIds,
  PettyCashVoucherDefaultVisibleAccountingColumnIds,
  PettyCashVoucherProtectedAccountingColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { formatPettyCashVoucherAmount } from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import { useDataEntryTablePreferences } from "@/app/src/hooks/shared/module/useDataEntryTablePreferences";
import type {
  PettyCashVoucherAccountingColumnId,
  PettyCashVoucherAccountingEntryTableProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { createPettyCashVoucherAccountingColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/entries/PettyCashVoucherEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import type { ModuleDataEntryColumnOption } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function PettyCashVoucherAccountingEntryTable({
  rows,
  title,
  totalCredit,
  totalDebit,
  variance,
}: PettyCashVoucherAccountingEntryTableProps) {
  const {
    columnOrder,
    visibleColumnIds,
    columnWidths,
    columnLabels,
    handleMoveColumn: moveColumn,
    handleToggleColumnVisibility: toggleColumnVisibility,
    handleUpdateColumnHeader: updateColumnHeader,
    handleUpdateColumnWidth: updateColumnWidth,
    handleFitColumnWidth: fitColumnWidth,
    handleResetColumns,
  } = useDataEntryTablePreferences<PettyCashVoucherAccountingColumnId>({
    storageKey: PettyCashVoucherAccountingTablePreferencesStorageKey,
    defaultColumnOrder: PettyCashVoucherDefaultAccountingColumnIds,
    defaultVisibleColumnIds: PettyCashVoucherDefaultVisibleAccountingColumnIds,
    defaultColumnWidths: PettyCashVoucherAccountingColumnWidths,
    defaultColumnLabels: PettyCashVoucherAccountingColumnLabels,
    protectedColumnIds: PettyCashVoucherProtectedAccountingColumnIds,
  });

  const allColumns = useMemo(() => createPettyCashVoucherAccountingColumns(columnLabels, columnWidths), [columnLabels, columnWidths]);

  const columns = useMemo(
    () =>
      columnOrder
        .filter((columnId) => visibleColumnIds.includes(columnId))
        .map((columnId) => {
          const col = allColumns[columnId];
          if (!col) return null;
          return {
            ...col,
            header: columnLabels[columnId] || col.header,
            width: columnWidths[columnId] ?? col.width,
          };
        })
        .filter((col): col is NonNullable<typeof col> => col !== null),
    [allColumns, columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !PettyCashVoucherProtectedAccountingColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: columnLabels[columnId],
        width: columnWidths[columnId],
      })),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isAccountingColumnId(fromId) && isAccountingColumnId(toId)) {
      moveColumn(fromId, toId);
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isAccountingColumnId(columnId)) {
      toggleColumnVisibility(columnId, isVisible);
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isAccountingColumnId(columnId)) {
      updateColumnHeader(columnId, header);
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isAccountingColumnId(columnId)) {
      updateColumnWidth(columnId, width);
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isAccountingColumnId(columnId)) {
      fitColumnWidth(columnId, rows);
    }
  }

  const effectiveRows =
    rows.length > 0
      ? rows
      : [
          {
            id: "pcf-accounting-default-1",
            accountCode: "",
            accountTitle: "",
            debit: "0.00",
            credit: "0.00",
            partyCode: "",
            partyName: "",
            particulars: "",
          },
        ];

  return (
    <ModuleDataEntry
      title={title}
      emptyRowLabel="accounting entry"
      footerDetails={
        <span className={joinClasses("text-sm font-semibold", variance < 0.001 ? "text-emerald-700" : "text-coralpink")}>
          Variance: {formatPettyCashVoucherAmount(variance)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={effectiveRows}
      canConfigureColumnsWhenReadonly
      isDraggable={false}
      isReadonly
      onAddRows={() => undefined}
      onDuplicateRow={() => undefined}
      onInsertRow={() => undefined}
      onMoveRow={() => undefined}
      onRemoveRow={() => undefined}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        debit: formatPettyCashVoucherAmount(totalDebit),
        credit: formatPettyCashVoucherAmount(totalCredit),
        particulars: variance < 0.001 ? "Balanced" : `Difference: ${formatPettyCashVoucherAmount(variance)}`,
      }}
    />
  );
}

function isAccountingColumnId(columnId: string): columnId is PettyCashVoucherAccountingColumnId {
  return PettyCashVoucherDefaultAccountingColumnIds.includes(columnId as PettyCashVoucherAccountingColumnId);
}
