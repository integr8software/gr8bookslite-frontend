"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type PaginationState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  TermsMaintenanceDefaultColumnOrder,
  TermsMaintenanceDefaultColumnVisibility,
  TermsMaintenanceDefaultSorting,
  TermsMaintenanceTableColumns,
  TermsMaintenanceTablePreferencesModuleKey,
  TermsMaintenanceTablePreferencesStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  TermsMaintenance,
  TermsMaintenanceTableColumnKey,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

export function useTermsMaintenanceTable(terms: TermsMaintenance[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: TermsMaintenanceDefaultColumnOrder,
    defaultColumnVisibility: TermsMaintenanceDefaultColumnVisibility,
    defaultSorting: TermsMaintenanceDefaultSorting,
    moduleKey: TermsMaintenanceTablePreferencesModuleKey,
    storageKey: TermsMaintenanceTablePreferencesStorageKey,
  });
  const columns = useMemo<ColumnDef<TermsMaintenance>[]>(
    () =>
      TermsMaintenanceTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        return createTermsMaintenanceColumn(column.key, column.label, column.className);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  return useReactTable({
    data: terms,
    columns,
    initialState: {
      columnOrder: TermsMaintenanceDefaultColumnOrder,
      columnVisibility: TermsMaintenanceDefaultColumnVisibility,
      sorting: TermsMaintenanceDefaultSorting,
    },
    state: {
      columnOrder,
      columnVisibility,
      pagination,
      sorting,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
}

function createTermsMaintenanceColumn(key: TermsMaintenanceTableColumnKey, header: string, className: string): ColumnDef<TermsMaintenance> {
  return {
    accessorKey: key,
    header,
    sortingFn: "alphanumeric",
    meta: { className, label: header },
  };
}
