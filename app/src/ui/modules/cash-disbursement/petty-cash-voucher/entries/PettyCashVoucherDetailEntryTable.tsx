import { useMemo } from "react";
import {
  PettyCashVoucherDefaultItemColumnIds,
  PettyCashVoucherDefaultVisibleItemColumnIds,
  PettyCashVoucherDetailTablePreferencesStorageKey,
  PettyCashVoucherItemColumnLabels,
  PettyCashVoucherItemColumnWidths,
  PettyCashVoucherProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import {
  createBlankPettyCashVoucherItem,
  formatPettyCashVoucherAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import { useDataEntryTablePreferences } from "@/app/src/hooks/shared/module/useDataEntryTablePreferences";
import type {
  PettyCashVoucherDetailEntryTableProps,
  PettyCashVoucherItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { createPettyCashVoucherItemColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/entries/PettyCashVoucherEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import type { ModuleDataEntryColumnOption } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function PettyCashVoucherDetailEntryTable({
  disbursementTypeOptions,
  ewtOptions,
  onOpenDisbursementTypeDrawer,
  onOpenResponsibilityCenterDrawer,
  onOpenSupplierDrawer,
  errors,
  isReadonly,
  items,
  onAddItems,
  onClearItems,
  onDuplicateItem,
  onInsertItem,
  onMoveItem,
  onRemoveItem,
  onUpdateItem,
  onUpdateItems,
  responsibilityCenterOptions,
  supplierOptions,
  taxCodes,
  totals,
  title,
  vatOptions,
}: PettyCashVoucherDetailEntryTableProps) {
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
  } = useDataEntryTablePreferences<PettyCashVoucherItemColumnId>({
    storageKey: PettyCashVoucherDetailTablePreferencesStorageKey,
    defaultColumnOrder: PettyCashVoucherDefaultItemColumnIds,
    defaultVisibleColumnIds: PettyCashVoucherDefaultVisibleItemColumnIds,
    defaultColumnWidths: PettyCashVoucherItemColumnWidths,
    defaultColumnLabels: PettyCashVoucherItemColumnLabels,
    protectedColumnIds: PettyCashVoucherProtectedItemColumnIds,
  });

  const allColumns = useMemo(
    () =>
      createPettyCashVoucherItemColumns({
        columnLabels,
        columnWidths,
        disbursementTypeOptions,
        ewtOptions,
        isReadonly,
        onOpenDisbursementTypeDrawer,
        onOpenResponsibilityCenterDrawer,
        onOpenSupplierDrawer,
        responsibilityCenterOptions,
        supplierOptions,
        taxCodes,
        updateItem: onUpdateItem,
        vatOptions,
      }),
    [
      columnLabels,
      columnWidths,
      disbursementTypeOptions,
      ewtOptions,
      isReadonly,
      onOpenDisbursementTypeDrawer,
      onOpenResponsibilityCenterDrawer,
      onOpenSupplierDrawer,
      onUpdateItem,
      responsibilityCenterOptions,
      supplierOptions,
      taxCodes,
      vatOptions,
    ],
  );

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
        isHideable: !PettyCashVoucherProtectedItemColumnIds.has(columnId),
        isVisible: visibleColumnIds.includes(columnId),
        label: columnLabels[columnId],
        width: columnWidths[columnId],
      })),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isItemColumnId(fromId) && isItemColumnId(toId)) {
      moveColumn(fromId, toId);
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isItemColumnId(columnId)) {
      toggleColumnVisibility(columnId, isVisible);
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isItemColumnId(columnId)) {
      updateColumnHeader(columnId, header);
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isItemColumnId(columnId)) {
      updateColumnWidth(columnId, width);
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isItemColumnId(columnId)) {
      fitColumnWidth(columnId, items);
    }
  }

  const effectiveItems = items.length > 0 ? items : [createBlankPettyCashVoucherItem()];

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title={title}
      emptyRowLabel="fund detail"
      error={errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">Total Amount: {formatPettyCashVoucherAmount(totals.amount)}</span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={effectiveItems}
      canConfigureColumnsWhenReadonly
      isDraggable={!isReadonly}
      isReadonly={isReadonly}
      onAddRows={onAddItems}
      onClearRow={(rowId) =>
        onUpdateItems(items.map((row) => (row.id === rowId ? { ...createBlankPettyCashVoucherItem(), id: rowId } : row)))
      }
      onClearRows={onClearItems}
      onDuplicateRow={onDuplicateItem}
      onInsertRow={onInsertItem}
      onMoveRow={onMoveItem}
      onRemoveRow={onRemoveItem}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        amount: formatPettyCashVoucherAmount(totals.amount),
        netAmount: formatPettyCashVoucherAmount(totals.netAmount),
        vatAmount: formatPettyCashVoucherAmount(totals.vatAmount),
        ewtAmount: formatPettyCashVoucherAmount(totals.ewtAmount),
        disburseAmount: formatPettyCashVoucherAmount(totals.disburseAmount),
      }}
    />
  );
}

function isItemColumnId(columnId: string): columnId is PettyCashVoucherItemColumnId {
  return PettyCashVoucherDefaultItemColumnIds.includes(columnId as PettyCashVoucherItemColumnId);
}
