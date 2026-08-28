"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ModuleTableBody } from "@/app/src/ui/shared/module/module-table/ModuleTableBody";
import { ModuleTableHeader } from "@/app/src/ui/shared/module/module-table/ModuleTableHeader";
import { ModuleTablePagination } from "@/app/src/ui/shared/module/module-table/ModuleTablePagination";
import { ModuleTableSyncStatus } from "@/app/src/ui/shared/module/ModuleTableSyncStatus";
import type { ModuleTableProps } from "@/app/src/types/shared/module/module-table/ModuleTable.types";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { readModuleTableStoredPagination, writeModuleTableStoredPagination } from "@/app/src/data/shared/module/ModuleTablePaginationData";

const DefaultPageSizeOptions = [5, 10, 15, 20, 25, 50];

export function ModuleTable<TData>({
  emptyDescription = "Try adjusting your filters or add a new record.",
  emptyIcon,
  emptyTitle = "No records found",
  enableColumnReorder = true,
  isLoading = false,
  isSyncing = false,
  lastSyncedAt,
  maxHeightClassName = "max-h-[58vh]",
  minWidthClassName = "min-w-[78rem]",
  paginationLabel = "records",
  paginationDensity = "default",
  paginationPageLimit = 3,
  paginationStorageKey,
  paginationTotalRows,
  pageSizeOptions = DefaultPageSizeOptions,
  renderRow,
  rootClassName,
  scrollContainerClassName = "overflow-x-auto overflow-y-auto",
  skeletonRowCount = 5,
  stickyToolbarAndHeader = false,
  stickyTopOffset = 0,
  table,
  tableTitle,
  toolbar,
  useColumnSizing = false,
  variant = "standalone",
}: ModuleTableProps<TData>) {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasLoadedPagination, setHasLoadedPagination] = useState(false);
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const pagination = table.getState().pagination;
  const fallbackPageSize = pageSizeOptions[0];
  const totalPages = table.getPageCount();
  const safeTotalPages = Math.max(1, totalPages);
  const totalRows = paginationTotalRows ?? table.getPrePaginationRowModel().rows.length;
  const firstRow = totalRows === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastRow = totalRows === 0 ? 0 : Math.min(firstRow + rows.length - 1, totalRows);
  const pageSizeOptionsKey = pageSizeOptions.join(",");
  const storageKey = useMemo(
    () => `gr8booksneo:module-table:${paginationStorageKey ?? pathname}:pagination`,
    [paginationStorageKey, pathname],
  );

  useEffect(() => {
    if (hasLoadedPagination) {
      return;
    }

    if (!fallbackPageSize) {
      return;
    }

    try {
      const savedPagination = readModuleTableStoredPagination(storageKey, pageSizeOptions, fallbackPageSize);

      if (savedPagination) {
        table.setPageSize(savedPagination.pageSize);
        table.setPageIndex(savedPagination.pageIndex);
      } else if (!pageSizeOptions.includes(pagination.pageSize)) {
        table.setPageSize(fallbackPageSize);
      }
    } catch {
      if (!pageSizeOptions.includes(pagination.pageSize)) {
        table.setPageSize(fallbackPageSize);
      }
    } finally {
      setHasLoadedPagination(true);
    }
  }, [fallbackPageSize, hasLoadedPagination, pageSizeOptions, pageSizeOptionsKey, pagination.pageSize, storageKey, table]);

  useEffect(() => {
    if (!hasLoadedPagination) {
      return;
    }

    writeModuleTableStoredPagination(storageKey, {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    });
  }, [hasLoadedPagination, pagination.pageIndex, pagination.pageSize, storageKey]);

  useEffect(() => {
    if (pagination.pageIndex <= safeTotalPages - 1) {
      return;
    }

    table.setPageIndex(safeTotalPages - 1);
  }, [pagination.pageIndex, safeTotalPages, table]);

  return (
    <div
      className={joinClasses(
        "isolate overflow-hidden bg-white",
        variant === "standalone" && "rounded-lg border border-darknavy/10 shadow-sm shadow-darknavy/5",
        rootClassName,
      )}
    >
      <div
        className={joinClasses(
          stickyToolbarAndHeader &&
            "sticky z-[60] -mx-px -mt-px w-[calc(100%+2px)] overflow-hidden rounded-t-lg border border-b-0 border-darknavy/10 bg-white",
        )}
        style={stickyToolbarAndHeader ? { top: stickyTopOffset } : undefined}
      >
        <ModuleTableSyncStatus isSyncing={isSyncing} lastSyncedAt={lastSyncedAt} tableTitle={tableTitle} />
        {toolbar ? <div className="border-b border-darknavy/10">{toolbar}</div> : null}
      </div>
      <div ref={scrollContainerRef} className={joinClasses(maxHeightClassName, scrollContainerClassName)}>
        <table
          className={joinClasses(
            "w-full table-fixed border-collapse text-left text-sm text-darknavy",
            minWidthClassName,
          )}
          style={useColumnSizing ? { minWidth: table.getTotalSize() } : undefined}
        >
          {useColumnSizing ? (
            <colgroup>
              {visibleColumns.map((column) => (
                <col key={column.id} style={{ width: column.getSize() }} />
              ))}
            </colgroup>
          ) : null}
          <ModuleTableHeader
            enableColumnReorder={enableColumnReorder}
            isLoading={isLoading}
            stickyTop={stickyToolbarAndHeader ? stickyTopOffset : undefined}
            scrollContainerRef={scrollContainerRef}
            table={table}
          />
          <ModuleTableBody
            emptyDescription={emptyDescription}
            emptyIcon={emptyIcon}
            emptyTitle={emptyTitle}
            isLoading={isLoading}
            renderRow={renderRow}
            rows={rows}
            skeletonRowCount={skeletonRowCount}
            visibleColumnCount={visibleColumnCount}
          />
        </table>
      </div>

      <ModuleTablePagination
        density={paginationDensity}
        firstRow={firstRow}
        label={paginationLabel}
        lastRow={lastRow}
        page={pagination.pageIndex + 1}
        pageLimit={paginationPageLimit}
        pageSize={pagination.pageSize}
        pageSizeOptions={pageSizeOptions}
        totalRows={totalRows}
        totalPages={totalPages}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
      />
    </div>
  );
}
