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
  DisbursementTypeDefaultColumnOrder,
  DisbursementTypeDefaultColumnVisibility,
  DisbursementTypeDefaultSorting,
  DisbursementTypeTableColumns,
  DisbursementTypeTablePreferencesModuleKey,
  DisbursementTypeTablePreferencesStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import { getDisbursementTypeTypeLabel } from "@/app/src/data/modules/financial-maintenance/disbursement-type/DisbursementTypeMaintenanceData";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  DisbursementType,
  DisbursementTypeColumnMeta,
  DisbursementTypeTableColumnKey,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";

export function useDisbursementTypeTable(disbursementTypes: DisbursementType[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: DisbursementTypeDefaultColumnOrder,
    defaultColumnVisibility: DisbursementTypeDefaultColumnVisibility,
    defaultSorting: DisbursementTypeDefaultSorting,
    moduleKey: DisbursementTypeTablePreferencesModuleKey,
    storageKey: DisbursementTypeTablePreferencesStorageKey,
  });

  const columns = useMemo<ColumnDef<DisbursementType>[]>(
    () =>
      DisbursementTypeTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        return createDisbursementTypeColumn(column.key, column.label, {
          className: column.className,
        });
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  return useReactTable({
    data: disbursementTypes,
    columns,
    initialState: {
      columnOrder: DisbursementTypeDefaultColumnOrder,
      columnVisibility: DisbursementTypeDefaultColumnVisibility,
      sorting: DisbursementTypeDefaultSorting,
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

function createDisbursementTypeColumn(
  key: DisbursementTypeTableColumnKey,
  header: string,
  meta: DisbursementTypeColumnMeta,
): ColumnDef<DisbursementType> {
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

  if (key === "type") {
    return {
      id: key,
      accessorFn: (row) => getDisbursementTypeTypeLabel(row.type),
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
