import {
  TaxMaintenanceExportColumns,
  TaxMaintenanceStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import type {
  TaxMaintenanceStatusFilter,
  TaxMaintenanceTableFiltersProps,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function TaxMaintenanceTableFilters({
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
}: TaxMaintenanceTableFiltersProps) {
  return (
    <ModuleTableToolbar
      className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
    >
      <div
        data-spotlight-id="maintenance-table-filters"
        className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(11rem,1fr)_minmax(8rem,0.42fr)]"
      >
        <ModuleTableSearch
          label="Search taxes"
          value={query}
          onChange={onQueryChange}
          placeholder="Search by name, percentage, account, or status"
        />
        <ModuleTableFilterSelect
          label="Status"
          value={statusFilter}
          options={[
            { label: "All", value: "" },
            ...TaxMaintenanceStatusOptions.map((status) => ({
              label: status,
              value: status,
            })),
          ]}
          onChange={(value) =>
            onStatusFilterChange(value as TaxMaintenanceStatusFilter)
          }
        />
      </div>
      <div
        data-spotlight-id="maintenance-table-options"
        className="grid grid-cols-3 gap-2 md:w-[10.75rem]"
      >
        <ModuleTableColumnVisibilityButton table={table} />
        {permissions.canExport ? (
          <ModuleTableExportButton
            allRows={exportAllRows}
            columns={TaxMaintenanceExportColumns}
            fileName="tax-maintenance"
            filteredRows={exportFilteredRows}
            isFiltered={hasActiveFilters}
            table={table}
            title="Tax Maintenance"
          />
        ) : (
          <span aria-hidden="true" />
        )}
        <ModuleTableResetButton
          className="px-2"
          isRefreshing={isRefreshing}
          onClick={onRefresh}
        >
          <span className="sr-only">Refresh</span>
        </ModuleTableResetButton>
      </div>
    </ModuleTableToolbar>
  );
}
