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
  CollectionTypeDefaultColumnOrder,
  CollectionTypeDefaultColumnVisibility,
  CollectionTypeDefaultSorting,
  CollectionTypeTableColumns,
  CollectionTypeTablePreferencesModuleKey,
  CollectionTypeTablePreferencesStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  CollectionType,
  CollectionTypeColumnMeta,
  CollectionTypeTableColumnKey,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";

export function useCollectionTypeTable(collectionTypes: CollectionType[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: CollectionTypeDefaultColumnOrder,
    defaultColumnVisibility: CollectionTypeDefaultColumnVisibility,
    defaultSorting: CollectionTypeDefaultSorting,
    moduleKey: CollectionTypeTablePreferencesModuleKey,
    storageKey: CollectionTypeTablePreferencesStorageKey,
  });

  const columns = useMemo<ColumnDef<CollectionType>[]>(
    () =>
      CollectionTypeTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        return createCollectionTypeColumn(column.key, column.label, {
          className: column.className,
        });
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  return useReactTable({
    data: collectionTypes,
    columns,
    initialState: {
      columnOrder: CollectionTypeDefaultColumnOrder,
      columnVisibility: CollectionTypeDefaultColumnVisibility,
      sorting: CollectionTypeDefaultSorting,
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

function createCollectionTypeColumn(
  key: CollectionTypeTableColumnKey,
  header: string,
  meta: CollectionTypeColumnMeta,
): ColumnDef<CollectionType> {
  const columnMeta = { ...meta, label: header };

  if (key === "accountCode") {
    return {
      id: key,
      accessorFn: (row) => row.generatedAccounts.map((account) => account.accountCode).join(" "),
      header,
      sortingFn: "alphanumeric",
      meta: columnMeta,
    };
  }

  if (key === "accountName") {
    return {
      id: key,
      accessorFn: (row) => row.generatedAccounts.map((account) => account.accountTitle).join(" "),
      header,
      sortingFn: "alphanumeric",
      meta: columnMeta,
    };
  }

  return {
    accessorKey: key,
    header,
    sortingFn: "alphanumeric",
    meta: columnMeta,
  };
}
