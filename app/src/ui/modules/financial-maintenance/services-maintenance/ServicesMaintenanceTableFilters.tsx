import {
  ServicesMaintenanceExportColumns,
  ServicesMaintenanceStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import type {
  ServicesMaintenanceStatusFilter,
  ServicesMaintenanceTableFiltersProps,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function ServicesMaintenanceTableFilters({
  exportAllRows,
  exportFilteredRows,
  hasActiveFilters,
  isRefreshing,
  permissions,
  query,
  statusFilter,
  table,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
}: ServicesMaintenanceTableFiltersProps) {
  return (
    <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(13rem,1.35fr)_minmax(7rem,0.7fr)]">
        <ModuleTableSearch
          label="Search services"
          value={query}
          onChange={onQueryChange}
          placeholder="Search by service, account code, or account title"
        />
        <ModuleTableFilterSelect
          label="Status"
          value={statusFilter}
          options={[
            { label: "All Status", value: "" },
            ...ServicesMaintenanceStatusOptions.map((status) => ({
              label: status,
              value: status,
            })),
          ]}
          onChange={(value) => onStatusFilterChange(value as ServicesMaintenanceStatusFilter)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
        <ModuleTableColumnVisibilityButton table={table} />
        {permissions.canExport ? (
          <ModuleTableExportButton
            allRows={exportAllRows}
            columns={ServicesMaintenanceExportColumns}
            fileName="services-maintenance"
            filteredRows={exportFilteredRows}
            isFiltered={hasActiveFilters}
            table={table}
            title="Services Maintenance"
          />
        ) : (
          <span aria-hidden="true" />
        )}
        <ModuleTableResetButton className="px-2" isRefreshing={isRefreshing} onClick={onRefresh}>
          <span className="sr-only">Refresh</span>
        </ModuleTableResetButton>
      </div>
    </ModuleTableToolbar>
  );
}
