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
  TaxMaintenanceDefaultColumnOrder,
  TaxMaintenanceDefaultColumnVisibility,
  TaxMaintenanceDefaultSorting,
  TaxMaintenanceTableColumns,
  TaxMaintenanceTablePreferencesModuleKey,
  TaxMaintenanceTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  TaxMaintenance,
  TaxMaintenanceTableColumnKey,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";

export function useTaxMaintenanceTable(taxes: TaxMaintenance[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const {
    columnOrder,
    columnVisibility,
    sorting,
    setColumnOrder,
    setColumnVisibility,
    setSorting,
  } = useTablePreferences({
    defaultColumnOrder: TaxMaintenanceDefaultColumnOrder,
    defaultColumnVisibility: TaxMaintenanceDefaultColumnVisibility,
    defaultSorting: TaxMaintenanceDefaultSorting,
    moduleKey: TaxMaintenanceTablePreferencesModuleKey,
    storageKey: TaxMaintenanceTablePreferencesStorageKey,
  });

  const columns = useMemo<ColumnDef<TaxMaintenance>[]>(
    () =>
      TaxMaintenanceTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
          };
        }

        return createTaxMaintenanceColumn(
          column.key,
          column.label,
          column.className,
        );
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  return useReactTable({
    data: taxes,
    columns,
    initialState: {
      columnOrder: TaxMaintenanceDefaultColumnOrder,
      columnVisibility: TaxMaintenanceDefaultColumnVisibility,
      sorting: TaxMaintenanceDefaultSorting,
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

function createTaxMaintenanceColumn(
  key: TaxMaintenanceTableColumnKey,
  header: string,
  className: string,
): ColumnDef<TaxMaintenance> {
  return {
    id: key,
    accessorFn: (tax) => getTaxMaintenanceColumnValue(tax, key),
    header,
    sortingFn: "alphanumeric",
    meta: { className, label: header },
  };
}

function getTaxMaintenanceColumnValue(
  tax: TaxMaintenance,
  key: TaxMaintenanceTableColumnKey,
) {
  switch (key) {
    case "inputVatAccountCode":
      return tax.accounts?.inputVatAccount?.accountCode ?? "";
    case "inputVatAccountTitle":
      return tax.accounts?.inputVatAccount?.accountTitle ?? "";
    case "outputVatAccountCode":
      return tax.accounts?.outputVatAccount?.accountCode ?? "";
    case "outputVatAccountTitle":
      return tax.accounts?.outputVatAccount?.accountTitle ?? "";
    case "vatPayableAccountCode":
      return tax.accounts?.vatPayableAccount?.accountCode ?? "";
    case "vatPayableAccountTitle":
      return tax.accounts?.vatPayableAccount?.accountTitle ?? "";
    case "deferredInputTaxAccountCode":
      return tax.accounts?.deferredInputTaxAccount?.accountCode ?? "";
    case "deferredInputTaxAccountTitle":
      return tax.accounts?.deferredInputTaxAccount?.accountTitle ?? "";
    case "deferredOutputVatAccountCode":
      return tax.accounts?.deferredOutputVatAccount?.accountCode ?? "";
    case "deferredOutputVatAccountTitle":
      return tax.accounts?.deferredOutputVatAccount?.accountTitle ?? "";
    default:
      return tax[key] ?? "";
  }
}
