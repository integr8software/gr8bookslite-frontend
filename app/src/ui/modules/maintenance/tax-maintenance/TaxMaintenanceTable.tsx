"use client";

import { Search } from "lucide-react";
import { TaxMaintenanceTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import { getTaxMaintenanceTableMinWidthClassName } from "@/app/src/data/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceData";
import { useTaxMaintenanceTable } from "@/app/src/hooks/modules/maintenance/tax-maintenance/useTaxMaintenanceTable";
import type { TaxMaintenanceTableProps } from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TaxMaintenanceTableFilters } from "@/app/src/ui/modules/maintenance/tax-maintenance/TaxMaintenanceTableFilters";
import { TaxMaintenanceTableRow } from "@/app/src/ui/modules/maintenance/tax-maintenance/TaxMaintenanceTableRow";

export function TaxMaintenanceTable({
  filteredTaxes,
  hasActiveFilters,
  isLoading,
  isRefreshing,
  lastSyncedAt,
  permissions,
  query,
  statusFilter,
  taxes,
  onEditTax,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onToggleStatus,
  onViewTax,
}: TaxMaintenanceTableProps) {
  const table = useTaxMaintenanceTable(filteredTaxes);
  const tableMinWidthClassName = getTaxMaintenanceTableMinWidthClassName(
    table.getVisibleLeafColumns().length,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <ModuleTable
        variant="embedded"
        emptyDescription="Add a VAT registration type to start managing tax defaults for parties."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No Tax Records Found"
        isLoading={isLoading}
        isSyncing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        minWidthClassName={`${tableMinWidthClassName} table-fixed`}
        paginationStorageKey={TaxMaintenanceTablePaginationStorageKey}
        table={table}
        tableTitle="Tax definitions"
        toolbar={
          <TaxMaintenanceTableFilters
            exportAllRows={taxes}
            exportFilteredRows={filteredTaxes}
            hasActiveFilters={hasActiveFilters}
            isRefreshing={isRefreshing}
            permissions={permissions}
            query={query}
            statusFilter={statusFilter}
            table={table}
            onQueryChange={onQueryChange}
            onRefresh={onRefresh}
            onStatusFilterChange={onStatusFilterChange}
          />
        }
        renderRow={(row) => (
          <TaxMaintenanceTableRow
            key={row.id}
            row={row}
            permissions={permissions}
            onEditTax={onEditTax}
            onToggleStatus={onToggleStatus}
            onViewTax={onViewTax}
          />
        )}
      />
    </div>
  );
}
