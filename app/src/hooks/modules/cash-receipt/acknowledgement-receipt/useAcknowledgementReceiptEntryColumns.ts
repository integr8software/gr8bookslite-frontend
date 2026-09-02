import { useMemo, useState } from "react";
import {
  AcknowledgementReceiptAccountingColumnIds,
  AcknowledgementReceiptAccountingColumnLabels,
  AcknowledgementReceiptAccountingColumnWidths,
  AcknowledgementReceiptAccountingDefaultVisibleColumnIds,
  AcknowledgementReceiptAccountingEntryView,
  AcknowledgementReceiptAccountingProtectedColumnIds,
  AcknowledgementReceiptCollectionColumnIds,
  AcknowledgementReceiptCollectionColumnLabels,
  AcknowledgementReceiptCollectionColumnWidths,
  AcknowledgementReceiptCollectionDefaultVisibleColumnIds,
  AcknowledgementReceiptCollectionEntryView,
  AcknowledgementReceiptCollectionProtectedColumnIds,
  type AcknowledgementReceiptAccountingColumnId,
  type AcknowledgementReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptEntryColumns";
import type {
  AcknowledgementReceiptEntryView,
  AcknowledgementReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import {
  calculateAccountingColumnFitWidth,
  calculateCollectionColumnFitWidth,
  isAcknowledgementReceiptAccountingColumnId,
  isAcknowledgementReceiptCollectionColumnId,
  moveColumnId,
  updateVisibleColumnIds,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptEntryColumnUtils";

export function useAcknowledgementReceiptEntryColumns({
  entryView,
  rows,
}: {
  entryView: AcknowledgementReceiptEntryView;
  rows: AcknowledgementReceiptLineEntry[];
}) {
  const [collectionColumnOrder, setCollectionColumnOrder] = useState<AcknowledgementReceiptCollectionColumnId[]>([
    ...AcknowledgementReceiptCollectionColumnIds,
  ]);
  const [visibleCollectionColumnIds, setVisibleCollectionColumnIds] = useState<AcknowledgementReceiptCollectionColumnId[]>([
    ...AcknowledgementReceiptCollectionDefaultVisibleColumnIds,
  ]);
  const [collectionColumnLabels, setCollectionColumnLabels] = useState<Record<AcknowledgementReceiptCollectionColumnId, string>>({
    ...AcknowledgementReceiptCollectionColumnLabels,
  });
  const [collectionColumnWidths, setCollectionColumnWidths] = useState<Record<AcknowledgementReceiptCollectionColumnId, number>>({
    ...AcknowledgementReceiptCollectionColumnWidths,
  });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<AcknowledgementReceiptAccountingColumnId[]>([
    ...AcknowledgementReceiptAccountingColumnIds,
  ]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<AcknowledgementReceiptAccountingColumnId[]>([
    ...AcknowledgementReceiptAccountingDefaultVisibleColumnIds,
  ]);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState<Record<AcknowledgementReceiptAccountingColumnId, string>>({
    ...AcknowledgementReceiptAccountingColumnLabels,
  });
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<Record<AcknowledgementReceiptAccountingColumnId, number>>({
    ...AcknowledgementReceiptAccountingColumnWidths,
  });

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(() => {
    if (entryView === AcknowledgementReceiptCollectionEntryView) {
      return collectionColumnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !AcknowledgementReceiptCollectionProtectedColumnIds.has(columnId),
        isVisible: visibleCollectionColumnIds.includes(columnId),
        label: collectionColumnLabels[columnId],
        width: collectionColumnWidths[columnId],
        widthMode: "fixed",
      }));
    }

    return accountingColumnOrder.map((columnId) => ({
      id: columnId,
      isHideable: !AcknowledgementReceiptAccountingProtectedColumnIds.has(columnId),
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
    if (!isAcknowledgementReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateCollectionColumnWidth(columnId: string, width: number) {
    if (!isAcknowledgementReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitCollectionColumnWidth(columnId: string) {
    if (!isAcknowledgementReceiptCollectionColumnId(columnId)) {
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
    if (!isAcknowledgementReceiptCollectionColumnId(fromColumnId) || !isAcknowledgementReceiptCollectionColumnId(toColumnId)) {
      return;
    }

    setCollectionColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetCollectionColumns() {
    setCollectionColumnOrder([...AcknowledgementReceiptCollectionColumnIds]);
    setVisibleCollectionColumnIds([...AcknowledgementReceiptCollectionDefaultVisibleColumnIds]);
    setCollectionColumnLabels({ ...AcknowledgementReceiptCollectionColumnLabels });
    setCollectionColumnWidths({ ...AcknowledgementReceiptCollectionColumnWidths });
  }

  function toggleCollectionColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isAcknowledgementReceiptCollectionColumnId(columnId)) {
      return;
    }

    if (!isVisible && AcknowledgementReceiptCollectionProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleCollectionColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, collectionColumnOrder, columnId, isVisible),
    );
  }

  function updateAccountingColumnHeader(columnId: string, header: string) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateAccountingColumnWidth(columnId: string, width: number) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitAccountingColumnWidth(columnId: string) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
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
    if (!isAcknowledgementReceiptAccountingColumnId(fromColumnId) || !isAcknowledgementReceiptAccountingColumnId(toColumnId)) {
      return;
    }

    setAccountingColumnOrder((currentOrder) => moveColumnId(currentOrder, fromColumnId, toColumnId));
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...AcknowledgementReceiptAccountingColumnIds]);
    setVisibleAccountingColumnIds([...AcknowledgementReceiptAccountingDefaultVisibleColumnIds]);
    setAccountingColumnLabels({ ...AcknowledgementReceiptAccountingColumnLabels });
    setAccountingColumnWidths({ ...AcknowledgementReceiptAccountingColumnWidths });
  }

  function toggleAccountingColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isAcknowledgementReceiptAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && AcknowledgementReceiptAccountingProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleAccountingColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(currentVisibleIds, accountingColumnOrder, columnId, isVisible),
    );
  }

  const columnHandlers =
    entryView === AcknowledgementReceiptCollectionEntryView
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

export { AcknowledgementReceiptAccountingEntryView, AcknowledgementReceiptCollectionEntryView };
