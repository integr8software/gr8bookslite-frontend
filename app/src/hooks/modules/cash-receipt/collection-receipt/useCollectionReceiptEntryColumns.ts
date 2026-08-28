import { useMemo, useState } from "react";
import {
  CollectionReceiptAccountingColumnIds,
  CollectionReceiptAccountingColumnLabels,
  CollectionReceiptAccountingColumnWidths,
  CollectionReceiptAccountingDefaultVisibleColumnIds,
  CollectionReceiptAccountingEntryView,
  CollectionReceiptAccountingProtectedColumnIds,
  CollectionReceiptCollectionColumnIds,
  CollectionReceiptCollectionColumnLabels,
  CollectionReceiptCollectionColumnWidths,
  CollectionReceiptCollectionDefaultVisibleColumnIds,
  CollectionReceiptCollectionEntryView,
  CollectionReceiptCollectionProtectedColumnIds,
  type CollectionReceiptAccountingColumnId,
  type CollectionReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptEntryColumns";
import type {
  CollectionReceiptEntryView,
  CollectionReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import {
  calculateAccountingColumnFitWidth,
  calculateCollectionColumnFitWidth,
  isCollectionReceiptAccountingColumnId,
  isCollectionReceiptCollectionColumnId,
  moveColumnId,
  updateVisibleColumnIds,
} from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptEntryColumnUtils";

export function useCollectionReceiptEntryColumns({
  entryView,
  rows,
}: {
  entryView: CollectionReceiptEntryView;
  rows: CollectionReceiptLineEntry[];
}) {
  const [collectionColumnOrder, setCollectionColumnOrder] = useState<CollectionReceiptCollectionColumnId[]>([
    ...CollectionReceiptCollectionColumnIds,
  ]);
  const [visibleCollectionColumnIds, setVisibleCollectionColumnIds] = useState<CollectionReceiptCollectionColumnId[]>([
    ...CollectionReceiptCollectionDefaultVisibleColumnIds,
  ]);
  const [collectionColumnLabels, setCollectionColumnLabels] = useState<Record<CollectionReceiptCollectionColumnId, string>>({
    ...CollectionReceiptCollectionColumnLabels,
  });
  const [collectionColumnWidths, setCollectionColumnWidths] = useState<Record<CollectionReceiptCollectionColumnId, number>>({
    ...CollectionReceiptCollectionColumnWidths,
  });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<CollectionReceiptAccountingColumnId[]>([
    ...CollectionReceiptAccountingColumnIds,
  ]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<CollectionReceiptAccountingColumnId[]>([
    ...CollectionReceiptAccountingDefaultVisibleColumnIds,
  ]);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState<Record<CollectionReceiptAccountingColumnId, string>>({
    ...CollectionReceiptAccountingColumnLabels,
  });
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<Record<CollectionReceiptAccountingColumnId, number>>({
    ...CollectionReceiptAccountingColumnWidths,
  });

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(() => {
    if (entryView === CollectionReceiptCollectionEntryView) {
      return collectionColumnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !CollectionReceiptCollectionProtectedColumnIds.has(columnId),
        isVisible: visibleCollectionColumnIds.includes(columnId),
        label: collectionColumnLabels[columnId],
        width: collectionColumnWidths[columnId],
        widthMode: "fixed",
      }));
    }

    return accountingColumnOrder.map((columnId) => ({
      id: columnId,
      isHideable: !CollectionReceiptAccountingProtectedColumnIds.has(columnId),
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
    if (!isCollectionReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateCollectionColumnWidth(columnId: string, width: number) {
    if (!isCollectionReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitCollectionColumnWidth(columnId: string) {
    if (!isCollectionReceiptCollectionColumnId(columnId)) {
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
    if (!isCollectionReceiptCollectionColumnId(fromColumnId) || !isCollectionReceiptCollectionColumnId(toColumnId)) {
      return;
    }

    setCollectionColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetCollectionColumns() {
    setCollectionColumnOrder([...CollectionReceiptCollectionColumnIds]);
    setVisibleCollectionColumnIds([...CollectionReceiptCollectionDefaultVisibleColumnIds]);
    setCollectionColumnLabels({ ...CollectionReceiptCollectionColumnLabels });
    setCollectionColumnWidths({ ...CollectionReceiptCollectionColumnWidths });
  }

  function toggleCollectionColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isCollectionReceiptCollectionColumnId(columnId)) {
      return;
    }

    if (!isVisible && CollectionReceiptCollectionProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleCollectionColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, collectionColumnOrder, columnId, isVisible),
    );
  }

  function updateAccountingColumnHeader(columnId: string, header: string) {
    if (!isCollectionReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateAccountingColumnWidth(columnId: string, width: number) {
    if (!isCollectionReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitAccountingColumnWidth(columnId: string) {
    if (!isCollectionReceiptAccountingColumnId(columnId)) {
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
    if (!isCollectionReceiptAccountingColumnId(fromColumnId) || !isCollectionReceiptAccountingColumnId(toColumnId)) {
      return;
    }

    setAccountingColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...CollectionReceiptAccountingColumnIds]);
    setVisibleAccountingColumnIds([...CollectionReceiptAccountingDefaultVisibleColumnIds]);
    setAccountingColumnLabels({ ...CollectionReceiptAccountingColumnLabels });
    setAccountingColumnWidths({ ...CollectionReceiptAccountingColumnWidths });
  }

  function toggleAccountingColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isCollectionReceiptAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && CollectionReceiptAccountingProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleAccountingColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, accountingColumnOrder, columnId, isVisible),
    );
  }

  const columnHandlers =
    entryView === CollectionReceiptCollectionEntryView
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

export { CollectionReceiptAccountingEntryView, CollectionReceiptCollectionEntryView };
