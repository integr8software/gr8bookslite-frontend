import { useMemo, useState } from "react";
import {
  ProvisionalReceiptAccountingColumnIds,
  ProvisionalReceiptAccountingColumnLabels,
  ProvisionalReceiptAccountingColumnWidths,
  ProvisionalReceiptAccountingDefaultVisibleColumnIds,
  ProvisionalReceiptAccountingEntryView,
  ProvisionalReceiptAccountingProtectedColumnIds,
  ProvisionalReceiptCollectionColumnIds,
  ProvisionalReceiptCollectionColumnLabels,
  ProvisionalReceiptCollectionColumnWidths,
  ProvisionalReceiptCollectionDefaultVisibleColumnIds,
  ProvisionalReceiptCollectionEntryView,
  ProvisionalReceiptCollectionProtectedColumnIds,
  type ProvisionalReceiptAccountingColumnId,
  type ProvisionalReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptEntryColumns";
import type {
  ProvisionalReceiptEntryView,
  ProvisionalReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import {
  calculateAccountingColumnFitWidth,
  calculateCollectionColumnFitWidth,
  isProvisionalReceiptAccountingColumnId,
  isProvisionalReceiptCollectionColumnId,
  moveColumnId,
  updateVisibleColumnIds,
} from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptEntryColumnUtils";

export function useProvisionalReceiptEntryColumns({
  entryView,
  rows,
}: {
  entryView: ProvisionalReceiptEntryView;
  rows: ProvisionalReceiptLineEntry[];
}) {
  const [collectionColumnOrder, setCollectionColumnOrder] = useState<ProvisionalReceiptCollectionColumnId[]>([
    ...ProvisionalReceiptCollectionColumnIds,
  ]);
  const [visibleCollectionColumnIds, setVisibleCollectionColumnIds] = useState<ProvisionalReceiptCollectionColumnId[]>([
    ...ProvisionalReceiptCollectionDefaultVisibleColumnIds,
  ]);
  const [collectionColumnLabels, setCollectionColumnLabels] = useState<Record<ProvisionalReceiptCollectionColumnId, string>>({
    ...ProvisionalReceiptCollectionColumnLabels,
  });
  const [collectionColumnWidths, setCollectionColumnWidths] = useState<Record<ProvisionalReceiptCollectionColumnId, number>>({
    ...ProvisionalReceiptCollectionColumnWidths,
  });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<ProvisionalReceiptAccountingColumnId[]>([
    ...ProvisionalReceiptAccountingColumnIds,
  ]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<ProvisionalReceiptAccountingColumnId[]>([
    ...ProvisionalReceiptAccountingDefaultVisibleColumnIds,
  ]);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState<Record<ProvisionalReceiptAccountingColumnId, string>>({
    ...ProvisionalReceiptAccountingColumnLabels,
  });
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<Record<ProvisionalReceiptAccountingColumnId, number>>({
    ...ProvisionalReceiptAccountingColumnWidths,
  });

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(() => {
    if (entryView === ProvisionalReceiptCollectionEntryView) {
      return collectionColumnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !ProvisionalReceiptCollectionProtectedColumnIds.has(columnId),
        isVisible: visibleCollectionColumnIds.includes(columnId),
        label: collectionColumnLabels[columnId],
        width: collectionColumnWidths[columnId],
        widthMode: "fixed",
      }));
    }

    return accountingColumnOrder.map((columnId) => ({
      id: columnId,
      isHideable: !ProvisionalReceiptAccountingProtectedColumnIds.has(columnId),
      isVisible: visibleAccountingColumnIds.includes(columnId),
      label: accountingColumnLabels[columnId],
      width: accountingColumnWidths[columnId],
      widthMode: "fixed",
    }));
  }, [
    accountingColumnLabels,
    accountingColumnOrder,
    accountingColumnWidths,
    collectionColumnLabels,
    collectionColumnOrder,
    collectionColumnWidths,
    entryView,
    visibleAccountingColumnIds,
    visibleCollectionColumnIds,
  ]);

  function updateCollectionColumnHeader(columnId: string, header: string) {
    if (!isProvisionalReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateCollectionColumnWidth(columnId: string, width: number) {
    if (!isProvisionalReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitCollectionColumnWidth(columnId: string) {
    if (!isProvisionalReceiptCollectionColumnId(columnId)) {
      return;
    }

    updateCollectionColumnWidth(
      columnId,
      calculateCollectionColumnFitWidth({
        columnId,
        columnLabels: collectionColumnLabels,
        rows,
      }),
    );
  }

  function moveCollectionColumn(fromColumnId: string, toColumnId: string) {
    if (!isProvisionalReceiptCollectionColumnId(fromColumnId) || !isProvisionalReceiptCollectionColumnId(toColumnId)) {
      return;
    }

    setCollectionColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetCollectionColumns() {
    setCollectionColumnOrder([...ProvisionalReceiptCollectionColumnIds]);
    setVisibleCollectionColumnIds([...ProvisionalReceiptCollectionDefaultVisibleColumnIds]);
    setCollectionColumnLabels({ ...ProvisionalReceiptCollectionColumnLabels });
    setCollectionColumnWidths({ ...ProvisionalReceiptCollectionColumnWidths });
  }

  function toggleCollectionColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isProvisionalReceiptCollectionColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProvisionalReceiptCollectionProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleCollectionColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, collectionColumnOrder, columnId, isVisible),
    );
  }

  function updateAccountingColumnHeader(columnId: string, header: string) {
    if (!isProvisionalReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateAccountingColumnWidth(columnId: string, width: number) {
    if (!isProvisionalReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitAccountingColumnWidth(columnId: string) {
    if (!isProvisionalReceiptAccountingColumnId(columnId)) {
      return;
    }

    updateAccountingColumnWidth(
      columnId,
      calculateAccountingColumnFitWidth({
        columnId,
        columnLabels: accountingColumnLabels,
        rows,
      }),
    );
  }

  function moveAccountingColumn(fromColumnId: string, toColumnId: string) {
    if (!isProvisionalReceiptAccountingColumnId(fromColumnId) || !isProvisionalReceiptAccountingColumnId(toColumnId)) {
      return;
    }

    setAccountingColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...ProvisionalReceiptAccountingColumnIds]);
    setVisibleAccountingColumnIds([...ProvisionalReceiptAccountingDefaultVisibleColumnIds]);
    setAccountingColumnLabels({ ...ProvisionalReceiptAccountingColumnLabels });
    setAccountingColumnWidths({ ...ProvisionalReceiptAccountingColumnWidths });
  }

  function toggleAccountingColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isProvisionalReceiptAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && ProvisionalReceiptAccountingProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleAccountingColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, accountingColumnOrder, columnId, isVisible),
    );
  }

  const columnHandlers =
    entryView === ProvisionalReceiptCollectionEntryView
      ? {
          onAutoColumnWidth: fitCollectionColumnWidth,
          onFitColumnWidth: fitCollectionColumnWidth,
          onMoveColumn: moveCollectionColumn,
          onResetColumns: resetCollectionColumns,
          onToggleColumnVisibility: toggleCollectionColumnVisibility,
          onUpdateColumnHeader: updateCollectionColumnHeader,
          onUpdateColumnWidth: updateCollectionColumnWidth,
        }
      : {
          onAutoColumnWidth: fitAccountingColumnWidth,
          onFitColumnWidth: fitAccountingColumnWidth,
          onMoveColumn: moveAccountingColumn,
          onResetColumns: resetAccountingColumns,
          onToggleColumnVisibility: toggleAccountingColumnVisibility,
          onUpdateColumnHeader: updateAccountingColumnHeader,
          onUpdateColumnWidth: updateAccountingColumnWidth,
        };

  return {
    accountingColumnLabels,
    accountingColumnOrder,
    accountingColumnWidths,
    collectionColumnLabels,
    collectionColumnOrder,
    collectionColumnWidths,
    columnHandlers,
    columnOptions,
    visibleAccountingColumnIds,
    visibleCollectionColumnIds,
  };
}

export { ProvisionalReceiptAccountingEntryView, ProvisionalReceiptCollectionEntryView };
