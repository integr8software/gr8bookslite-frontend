export type ModuleTableStoredPagination = {
  pageIndex: number;
  pageSize: number;
};

export function readModuleTableStoredPagination(
  storageKey: string,
  pageSizeOptions: readonly number[],
  fallbackPageSize: number,
): ModuleTableStoredPagination | null {
  const savedPagination = window.localStorage.getItem(storageKey);

  if (!savedPagination) {
    return null;
  }

  const parsed = JSON.parse(savedPagination) as {
    pageIndex?: unknown;
    pageSize?: unknown;
  };

  return {
    pageIndex: typeof parsed.pageIndex === "number" && parsed.pageIndex >= 0 ? parsed.pageIndex : 0,
    pageSize: typeof parsed.pageSize === "number" && pageSizeOptions.includes(parsed.pageSize) ? parsed.pageSize : fallbackPageSize,
  };
}

export function writeModuleTableStoredPagination(storageKey: string, pagination: ModuleTableStoredPagination) {
  window.localStorage.setItem(storageKey, JSON.stringify(pagination));
}
