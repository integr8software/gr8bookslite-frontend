"use client";

import { Search } from "lucide-react";
import { ServicesMaintenanceTablePaginationStorageKey } from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { getServicesMaintenanceTableMinWidthClassName } from "@/app/src/data/modules/financial-maintenance/services-maintenance/ServicesMaintenanceData";
import { useServicesMaintenanceTable } from "@/app/src/hooks/modules/financial-maintenance/services-maintenance/useServicesMaintenanceTable";
import type { ServicesMaintenanceTableProps } from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ServicesMaintenanceTableFilters } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTableFilters";
import { ServicesMaintenanceTableRow } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTableRow";

export function ServicesMaintenanceTable({
  filteredServices,
  hasActiveFilters,
  isLoading,
  isRefreshing,
  lastSyncedAt,
  permissions,
  query,
  services,
  statusFilter,
  onEditService,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onToggleStatus,
  onViewService,
}: ServicesMaintenanceTableProps) {
  const table = useServicesMaintenanceTable(filteredServices);
  const tableMinWidthClassName = getServicesMaintenanceTableMinWidthClassName(table.getVisibleLeafColumns().length);

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <ModuleTable
        variant="embedded"
        emptyDescription="Add a service to start managing Service Revenues account setup."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No Service Records Found"
        isLoading={isLoading}
        isSyncing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        minWidthClassName={`${tableMinWidthClassName} table-fixed`}
        paginationStorageKey={ServicesMaintenanceTablePaginationStorageKey}
        table={table}
        tableTitle="Services"
        toolbar={
          <ServicesMaintenanceTableFilters
            exportAllRows={services}
            exportFilteredRows={filteredServices}
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
          <ServicesMaintenanceTableRow
            key={row.id}
            permissions={permissions}
            row={row}
            onEditService={onEditService}
            onToggleStatus={onToggleStatus}
            onViewService={onViewService}
          />
        )}
      />
    </div>
  );
}
