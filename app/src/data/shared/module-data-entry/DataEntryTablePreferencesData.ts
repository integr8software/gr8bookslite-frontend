export type StoredDataEntryPreferences<TColumnId extends string> = {
  columnOrder?: TColumnId[];
  visibleColumnIds?: TColumnId[];
  columnWidths?: Record<TColumnId, number>;
  columnLabels?: Record<TColumnId, string>;
};

export function readDataEntryPreferences<TColumnId extends string>({
  storageKey,
  defaultColumnOrder,
  defaultVisibleColumnIds,
  defaultColumnWidths,
  defaultColumnLabels,
}: {
  storageKey: string;
  defaultColumnOrder: TColumnId[];
  defaultVisibleColumnIds: TColumnId[];
  defaultColumnWidths: Record<TColumnId, number>;
  defaultColumnLabels?: Record<TColumnId, string>;
}): {
  columnOrder: TColumnId[];
  visibleColumnIds: TColumnId[];
  columnWidths: Record<TColumnId, number>;
  columnLabels: Record<TColumnId, string>;
} {
  if (typeof window === "undefined") {
    return {
      columnOrder: defaultColumnOrder,
      visibleColumnIds: defaultVisibleColumnIds,
      columnWidths: defaultColumnWidths,
      columnLabels: defaultColumnLabels ?? ({} as Record<TColumnId, string>),
    };
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {
        columnOrder: defaultColumnOrder,
        visibleColumnIds: defaultVisibleColumnIds,
        columnWidths: defaultColumnWidths,
        columnLabels: defaultColumnLabels ?? ({} as Record<TColumnId, string>),
      };
    }

    const parsed = JSON.parse(raw) as StoredDataEntryPreferences<TColumnId>;
    const defaultColumnSet = new Set(defaultColumnOrder);

    // Reconstruct valid column order
    const validStoredOrder = Array.isArray(parsed.columnOrder)
      ? parsed.columnOrder.filter((id) => defaultColumnSet.has(id))
      : [];
    const missingColumns = defaultColumnOrder.filter((id) => !validStoredOrder.includes(id));
    const columnOrder = [...validStoredOrder, ...missingColumns];

    // Reconstruct valid visible columns
    const visibleColumnIds = Array.isArray(parsed.visibleColumnIds)
      ? parsed.visibleColumnIds.filter((id) => defaultColumnSet.has(id))
      : defaultVisibleColumnIds;

    // Merge column widths
    const columnWidths = {
      ...defaultColumnWidths,
      ...(parsed.columnWidths && typeof parsed.columnWidths === "object" ? parsed.columnWidths : {}),
    };

    // Merge column labels
    const columnLabels = {
      ...(defaultColumnLabels ?? {}),
      ...(parsed.columnLabels && typeof parsed.columnLabels === "object" ? parsed.columnLabels : {}),
    } as Record<TColumnId, string>;

    return {
      columnOrder,
      visibleColumnIds,
      columnWidths,
      columnLabels,
    };
  } catch {
    return {
      columnOrder: defaultColumnOrder,
      visibleColumnIds: defaultVisibleColumnIds,
      columnWidths: defaultColumnWidths,
      columnLabels: defaultColumnLabels ?? ({} as Record<TColumnId, string>),
    };
  }
}

export function writeDataEntryPreferences<TColumnId extends string>(
  storageKey: string,
  preferences: StoredDataEntryPreferences<TColumnId>,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  } catch {
    // Ignore storage quota errors
  }
}
