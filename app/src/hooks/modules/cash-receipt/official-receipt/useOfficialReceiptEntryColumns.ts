import { useMemo, useState } from "react";
import {
  OfficialReceiptAccountingColumnIds,
  OfficialReceiptAccountingColumnLabels,
  OfficialReceiptAccountingColumnWidths,
  OfficialReceiptAccountingDefaultVisibleColumnIds,
  OfficialReceiptAccountingEntryView,
  OfficialReceiptAccountingProtectedColumnIds,
  OfficialReceiptCollectionColumnIds,
  OfficialReceiptCollectionColumnLabels,
  OfficialReceiptCollectionColumnWidths,
  OfficialReceiptCollectionDefaultVisibleColumnIds,
  OfficialReceiptCollectionEntryView,
  OfficialReceiptCollectionProtectedColumnIds,
  type OfficialReceiptAccountingColumnId,
  type OfficialReceiptCollectionColumnId,
} from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptEntryColumns";
import type {
  OfficialReceiptEntryView,
  OfficialReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import {
  calculateAccountingColumnFitWidth,
  calculateCollectionColumnFitWidth,
  isOfficialReceiptAccountingColumnId,
  isOfficialReceiptCollectionColumnId,
  moveColumnId,
  updateVisibleColumnIds,
} from "@/app/src/hooks/modules/cash-receipt/official-receipt/utils/OfficialReceiptEntryColumnUtils";

export function useOfficialReceiptEntryColumns({
  entryView,
  rows,
}: {
  entryView: OfficialReceiptEntryView;
  rows: OfficialReceiptLineEntry[];
}) {
  const [collectionColumnOrder, setCollectionColumnOrder] = useState<
    OfficialReceiptCollectionColumnId[]
  >([...OfficialReceiptCollectionColumnIds]);
  const [visibleCollectionColumnIds, setVisibleCollectionColumnIds] = useState<
    OfficialReceiptCollectionColumnId[]
  >([...OfficialReceiptCollectionDefaultVisibleColumnIds]);
  const [collectionColumnLabels, setCollectionColumnLabels] = useState<
    Record<OfficialReceiptCollectionColumnId, string>
  >({ ...OfficialReceiptCollectionColumnLabels });
  const [collectionColumnWidths, setCollectionColumnWidths] = useState<
    Record<OfficialReceiptCollectionColumnId, number>
  >({ ...OfficialReceiptCollectionColumnWidths });
  const [accountingColumnOrder, setAccountingColumnOrder] = useState<
    OfficialReceiptAccountingColumnId[]
  >([...OfficialReceiptAccountingColumnIds]);
  const [visibleAccountingColumnIds, setVisibleAccountingColumnIds] = useState<
    OfficialReceiptAccountingColumnId[]
  >([...OfficialReceiptAccountingDefaultVisibleColumnIds]);
  const [accountingColumnLabels, setAccountingColumnLabels] = useState<
    Record<OfficialReceiptAccountingColumnId, string>
  >({ ...OfficialReceiptAccountingColumnLabels });
  const [accountingColumnWidths, setAccountingColumnWidths] = useState<
    Record<OfficialReceiptAccountingColumnId, number>
  >({ ...OfficialReceiptAccountingColumnWidths });

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(() => {
    if (entryView === OfficialReceiptCollectionEntryView) {
      return collectionColumnOrder.map((columnId) => ({
        id: columnId,
        isHideable: !OfficialReceiptCollectionProtectedColumnIds.has(columnId),
        isVisible: visibleCollectionColumnIds.includes(columnId),
        label: collectionColumnLabels[columnId],
        width: collectionColumnWidths[columnId],
        widthMode: "fixed",
      }));
    }

    return accountingColumnOrder.map((columnId) => ({
      id: columnId,
      isHideable: !OfficialReceiptAccountingProtectedColumnIds.has(columnId),
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
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateCollectionColumnWidth(columnId: string, width: number) {
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
      return;
    }

    setCollectionColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitCollectionColumnWidth(columnId: string) {
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
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
    if (
      !isOfficialReceiptCollectionColumnId(fromColumnId) ||
      !isOfficialReceiptCollectionColumnId(toColumnId)
    ) {
      return;
    }

    setCollectionColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function resetCollectionColumns() {
    setCollectionColumnOrder([...OfficialReceiptCollectionColumnIds]);
    setVisibleCollectionColumnIds([
      ...OfficialReceiptCollectionDefaultVisibleColumnIds,
    ]);
    setCollectionColumnLabels({ ...OfficialReceiptCollectionColumnLabels });
    setCollectionColumnWidths({ ...OfficialReceiptCollectionColumnWidths });
  }

  function toggleCollectionColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isOfficialReceiptCollectionColumnId(columnId)) {
      return;
    }

    if (!isVisible && OfficialReceiptCollectionProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleCollectionColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(
        currentVisibleIds,
        collectionColumnOrder,
        columnId,
        isVisible,
      ),
    );
  }

  function updateAccountingColumnHeader(columnId: string, header: string) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateAccountingColumnWidth(columnId: string, width: number) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
      return;
    }

    setAccountingColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitAccountingColumnWidth(columnId: string) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
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
    if (
      !isOfficialReceiptAccountingColumnId(fromColumnId) ||
      !isOfficialReceiptAccountingColumnId(toColumnId)
    ) {
      return;
    }

    setAccountingColumnOrder((currentOrder) =>
      moveColumnId(currentOrder, fromColumnId, toColumnId),
    );
  }

  function resetAccountingColumns() {
    setAccountingColumnOrder([...OfficialReceiptAccountingColumnIds]);
    setVisibleAccountingColumnIds([
      ...OfficialReceiptAccountingDefaultVisibleColumnIds,
    ]);
    setAccountingColumnLabels({ ...OfficialReceiptAccountingColumnLabels });
    setAccountingColumnWidths({ ...OfficialReceiptAccountingColumnWidths });
  }

  function toggleAccountingColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isOfficialReceiptAccountingColumnId(columnId)) {
      return;
    }

    if (!isVisible && OfficialReceiptAccountingProtectedColumnIds.has(columnId)) {
      return;
    }

    setVisibleAccountingColumnIds((currentVisibleIds) =>
      updateVisibleColumnIds(
        currentVisibleIds,
        accountingColumnOrder,
        columnId,
        isVisible,
      ),
    );
  }

  const columnHandlers =
    entryView === OfficialReceiptCollectionEntryView
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

export { OfficialReceiptAccountingEntryView, OfficialReceiptCollectionEntryView };
