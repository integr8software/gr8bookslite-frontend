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
  ProjectMaintenanceDefaultColumnOrder,
  ProjectMaintenanceDefaultColumnVisibility,
  ProjectMaintenanceDefaultSorting,
  ProjectMaintenanceTableColumns,
  ProjectMaintenanceTablePreferencesModuleKey,
  ProjectMaintenanceTablePreferencesStorageKey,
} from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  ProjectMaintenance,
  ProjectMaintenanceTableColumnKey,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

export function useProjectMaintenanceTable(projects: ProjectMaintenance[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: ProjectMaintenanceDefaultColumnOrder,
    defaultColumnVisibility: ProjectMaintenanceDefaultColumnVisibility,
    defaultSorting: ProjectMaintenanceDefaultSorting,
    moduleKey: ProjectMaintenanceTablePreferencesModuleKey,
    storageKey: ProjectMaintenanceTablePreferencesStorageKey,
  });
  const columns = useMemo<ColumnDef<ProjectMaintenance>[]>(
    () =>
      ProjectMaintenanceTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        return createProjectMaintenanceColumn(column.key, column.label, column.className);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  return useReactTable({
    data: projects,
    columns,
    initialState: {
      columnOrder: ProjectMaintenanceDefaultColumnOrder,
      columnVisibility: ProjectMaintenanceDefaultColumnVisibility,
      sorting: ProjectMaintenanceDefaultSorting,
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

function createProjectMaintenanceColumn(
  key: ProjectMaintenanceTableColumnKey,
  header: string,
  className: string,
): ColumnDef<ProjectMaintenance> {
  return {
    accessorKey: key,
    header,
    sortingFn: "alphanumeric",
    meta: { className, label: header },
  };
}
