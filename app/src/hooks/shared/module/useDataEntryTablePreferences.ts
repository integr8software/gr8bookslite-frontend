"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  readDataEntryPreferences,
  writeDataEntryPreferences,
} from "@/app/src/data/shared/module-data-entry/DataEntryTablePreferencesData";
import {
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export type UseDataEntryTablePreferencesOptions<TColumnId extends string> = {
  storageKey: string;
  defaultColumnOrder: TColumnId[];
  defaultVisibleColumnIds: TColumnId[];
  defaultColumnWidths: Record<TColumnId, number>;
  defaultColumnLabels?: Record<TColumnId, string>;
  protectedColumnIds?: Set<TColumnId>;
};

export function useDataEntryTablePreferences<TColumnId extends string>({
  storageKey,
  defaultColumnOrder,
  defaultVisibleColumnIds,
  defaultColumnWidths,
  defaultColumnLabels = {} as Record<TColumnId, string>,
  protectedColumnIds,
}: UseDataEntryTablePreferencesOptions<TColumnId>) {
  const [initial] = useState(() =>
    readDataEntryPreferences({
      storageKey,
      defaultColumnOrder,
      defaultVisibleColumnIds,
      defaultColumnWidths,
      defaultColumnLabels,
    }),
  );

  const [columnOrder, setColumnOrder] = useState<TColumnId[]>(initial.columnOrder);
  const [visibleColumnIds, setVisibleColumnIds] = useState<TColumnId[]>(initial.visibleColumnIds);
  const [columnWidths, setColumnWidths] = useState<Record<TColumnId, number>>(initial.columnWidths);
  const [columnLabels, setColumnLabels] = useState<Record<TColumnId, string>>(initial.columnLabels);

  const stateRef = useRef({
    columnOrder: initial.columnOrder,
    visibleColumnIds: initial.visibleColumnIds,
    columnWidths: initial.columnWidths,
    columnLabels: initial.columnLabels,
  });
  useEffect(() => {
    stateRef.current = {
      columnOrder,
      visibleColumnIds,
      columnWidths,
      columnLabels,
    };
  }, [columnLabels, columnOrder, columnWidths, visibleColumnIds]);

  const handleMoveColumn = useCallback(
    (fromId: TColumnId, toId: TColumnId) => {
      setColumnOrder((currentOrder) => {
        const nextOrder = reorderColumnIds(currentOrder, fromId, toId);
        writeDataEntryPreferences(storageKey, {
          ...stateRef.current,
          columnOrder: nextOrder,
        });
        return nextOrder;
      });
    },
    [storageKey],
  );

  const handleToggleColumnVisibility = useCallback(
    (columnId: TColumnId, isVisible: boolean) => {
      if (!isVisible && protectedColumnIds?.has(columnId)) {
        return;
      }
      setVisibleColumnIds((currentIds) => {
        const nextVisible = toggleVisibleColumnId(
          currentIds,
          stateRef.current.columnOrder,
          columnId,
          isVisible,
        );
        writeDataEntryPreferences(storageKey, {
          ...stateRef.current,
          visibleColumnIds: nextVisible,
        });
        return nextVisible;
      });
    },
    [protectedColumnIds, storageKey],
  );

  const handleUpdateColumnWidth = useCallback(
    (columnId: TColumnId, width: number) => {
      setColumnWidths((currentWidths) => {
        const nextWidths = {
          ...currentWidths,
          [columnId]: clampColumnWidth(width),
        };
        writeDataEntryPreferences(storageKey, {
          ...stateRef.current,
          columnWidths: nextWidths,
        });
        return nextWidths;
      });
    },
    [storageKey],
  );

  const handleUpdateColumnHeader = useCallback(
    (columnId: TColumnId, header: string) => {
      setColumnLabels((currentLabels) => {
        const nextLabels = {
          ...currentLabels,
          [columnId]: header,
        };
        writeDataEntryPreferences(storageKey, {
          ...stateRef.current,
          columnLabels: nextLabels,
        });
        return nextLabels;
      });
    },
    [storageKey],
  );

  const handleFitColumnWidth = useCallback(
    <TRow>(
      columnId: TColumnId,
      rows: TRow[],
      getValue?: (row: TRow, columnId: TColumnId) => unknown,
    ) => {
      const label = stateRef.current.columnLabels[columnId] || String(columnId);
      const width = calculateFitColumnWidth(label, rows, columnId, getValue);
      handleUpdateColumnWidth(columnId, width);
    },
    [handleUpdateColumnWidth],
  );

  const handleResetColumns = useCallback(() => {
    setColumnOrder(defaultColumnOrder);
    setVisibleColumnIds(defaultVisibleColumnIds);
    setColumnWidths(defaultColumnWidths);
    setColumnLabels(defaultColumnLabels);
    writeDataEntryPreferences(storageKey, {
      columnOrder: defaultColumnOrder,
      visibleColumnIds: defaultVisibleColumnIds,
      columnWidths: defaultColumnWidths,
      columnLabels: defaultColumnLabels,
    });
  }, [
    defaultColumnLabels,
    defaultColumnOrder,
    defaultColumnWidths,
    defaultVisibleColumnIds,
    storageKey,
  ]);

  return {
    columnOrder,
    setColumnOrder,
    visibleColumnIds,
    setVisibleColumnIds,
    columnWidths,
    setColumnWidths,
    columnLabels,
    setColumnLabels,
    handleMoveColumn,
    handleToggleColumnVisibility,
    handleUpdateColumnWidth,
    handleUpdateColumnHeader,
    handleFitColumnWidth,
    handleResetColumns,
  };
}
