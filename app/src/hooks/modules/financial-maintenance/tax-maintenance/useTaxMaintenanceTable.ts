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
} from "@/app/src/constants/modules/financial-maintenance/tax-maintenance/TaxMaintenanceConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
  TaxMaintenance,
  TaxMaintenanceAccountSummary,
  TaxMaintenanceTableColumnKey,
} from "@/app/src/types/modules/financial-maintenance/tax-maintenance/TaxMaintenanceTypes";

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
      return getAccountCode(tax.accounts?.inputVatAccount);
    case "inputVatAccountTitle":
      return getAccountTitle(tax.accounts?.inputVatAccount);
    case "outputVatAccountCode":
      return getAccountCode(tax.accounts?.outputVatAccount);
    case "outputVatAccountTitle":
      return getAccountTitle(tax.accounts?.outputVatAccount);
    case "deferredVatAccountCode":
      return getAccountCode(tax.accounts?.deferredVatAccount);
    case "deferredVatAccountTitle":
      return getAccountTitle(tax.accounts?.deferredVatAccount);
    case "expandedWithholdingTaxAccountCode":
      return getAccountCode(tax.accounts?.expandedWithholdingTaxAccount);
    case "expandedWithholdingTaxAccountTitle":
      return getAccountTitle(tax.accounts?.expandedWithholdingTaxAccount);
    case "creditableWithholdingTaxAccountCode":
      return getAccountCode(tax.accounts?.creditableWithholdingTaxAccount);
    case "creditableWithholdingTaxAccountTitle":
      return getAccountTitle(tax.accounts?.creditableWithholdingTaxAccount);
    case "withholdingVatableTaxAccountCode":
      return getAccountCode(tax.accounts?.withholdingVatableTaxAccount);
    case "withholdingVatableTaxAccountTitle":
      return getAccountTitle(tax.accounts?.withholdingVatableTaxAccount);
    case "finalWithholdingTaxAccountCode":
      return getAccountCode(tax.accounts?.finalWithholdingTaxAccount);
    case "finalWithholdingTaxAccountTitle":
      return getAccountTitle(tax.accounts?.finalWithholdingTaxAccount);
    default:
      return tax[key] ?? "";
  }
}

function getAccountCode(account?: TaxMaintenanceAccountSummary | null) {
  return account?.accountCode ?? "";
}

function getAccountTitle(account?: TaxMaintenanceAccountSummary | null) {
  return account?.accountTitle ?? "";
}

