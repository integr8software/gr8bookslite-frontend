import type { ModuleDataEntryColumnOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

/**
 * Reorder column IDs when dragged in ModuleDataEntry.
 */
export function reorderColumnIds<TColumnId extends string>(
  order: TColumnId[],
  fromColumnId: TColumnId,
  toColumnId: TColumnId,
): TColumnId[] {
  const nextOrder = order.filter((columnId) => columnId !== fromColumnId);
  const targetIndex = nextOrder.indexOf(toColumnId);
  nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, fromColumnId);
  return nextOrder;
}

/**
 * Toggle column visibility while preserving the configured column order.
 */
export function toggleVisibleColumnId<TColumnId extends string>(
  visibleIds: TColumnId[],
  order: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
): TColumnId[] {
  const nextIds = new Set(visibleIds);
  if (isVisible) {
    nextIds.add(columnId);
  } else {
    nextIds.delete(columnId);
  }
  return order.filter((currentColumnId) => nextIds.has(currentColumnId));
}

/**
 * Calculate column fit width based on header label and longest row cell string length.
 */
export function calculateFitColumnWidth<TRow, TColumnId extends keyof TRow & string>(
  label: string,
  rows: TRow[],
  columnId: TColumnId,
  minWidth = 112,
): number {
  const longestLength = rows.reduce(
    (length, row) => Math.max(length, String(row[columnId] ?? "").length),
    label.length,
  );
  return clampColumnWidth(Math.max(minWidth, longestLength * 8 + 76));
}

/**
 * Build ModuleDataEntryColumnOption list for column configuration dropdowns.
 */
export function buildColumnOptions<TColumnId extends string>(
  columnOrder: TColumnId[],
  columnLabels: Record<TColumnId, string>,
  columnWidths: Record<TColumnId, number>,
  visibleColumnIds: TColumnId[],
  protectedColumnIds?: Set<TColumnId> | readonly TColumnId[],
): ModuleDataEntryColumnOption[] {
  const protectedSet = protectedColumnIds
    ? protectedColumnIds instanceof Set
      ? protectedColumnIds
      : new Set(protectedColumnIds)
    : undefined;

  return columnOrder.map((columnId) => ({
    id: columnId,
    label: columnLabels[columnId],
    isVisible: visibleColumnIds.includes(columnId),
    isHideable: protectedSet ? !protectedSet.has(columnId) : true,
    width: columnWidths[columnId],
    widthMode: "fixed",
  }));
}
