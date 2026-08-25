import {
  DiscountMaintenanceExportColumns,
  DiscountMaintenanceStatusOptions,
  DiscountMaintenanceTypeFilterOptions,
  DiscountMaintenanceValueTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import type {
  DiscountStatusFilter,
  DiscountTypeFilter,
  DiscountMaintenanceTableFiltersProps,
  DiscountValueTypeFilter,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

const discountTypeTabs: readonly ModuleTabItem<DiscountTypeFilter>[] = DiscountMaintenanceTypeFilterOptions.map((option) => ({
  id: option.value as DiscountTypeFilter,
  label: option.label,
}));

export function DiscountMaintenanceTableFilters({
  discountTypeFilter,
  exportAllRows,
  exportFilteredRows,
  hasActiveFilters,
  isRefreshing,
  permissions,
  query,
  statusFilter,
  table,
  typeFilter,
  onDiscountTypeFilterChange,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onTypeFilterChange,
}: DiscountMaintenanceTableFiltersProps) {
  return (
    <div>
      <div className="grid gap-2 border-b border-darknavy/10 px-3 py-3 xl:flex xl:items-end xl:justify-between xl:pb-2 xl:pt-2">
        <div className="xl:hidden">
          <ModuleTableFilterSelect
            label="Type"
            value={typeFilter}
            options={DiscountMaintenanceTypeFilterOptions}
            onChange={(value) => onTypeFilterChange(value as DiscountTypeFilter)}
          />
        </div>
        <div className="hidden xl:block">
          <ModuleTabs
            activeTab={typeFilter}
            ariaLabel="Discount type tabs"
            onTabChange={onTypeFilterChange}
            tabs={discountTypeTabs}
          />
        </div>
      </div>
      <ModuleTableToolbar
        className="min-w-0 !grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3"
        data-spotlight-id="discount-maintenance-filters"
      >
        <div
          data-spotlight-id="maintenance-table-filters"
          className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid-cols-[minmax(13rem,1.35fr)_minmax(8rem,0.85fr)_minmax(7rem,0.7fr)_auto]"
        >
          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <ModuleTableSearch
              label="Search discounts"
              value={query}
              onChange={onQueryChange}
              placeholder="Search by name, type, value, account, or status"
            />
          </div>
          <ModuleTableFilterSelect
            label="Discount Type"
            value={discountTypeFilter}
            options={[
              { label: "All", value: "All" },
              ...DiscountMaintenanceValueTypeOptions.map((type) => ({
                label: type,
                value: type,
              })),
            ]}
            onChange={(value) => onDiscountTypeFilterChange(value as DiscountValueTypeFilter)}
          />
          <ModuleTableFilterSelect
            label="Status"
            value={statusFilter}
            options={[
              { label: "All", value: "" },
              ...DiscountMaintenanceStatusOptions.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            onChange={(value) => onStatusFilterChange(value as DiscountStatusFilter)}
          />
          <div
            data-spotlight-id="maintenance-table-options"
            className="grid w-full grid-cols-3 gap-2 sm:w-[10.75rem] sm:self-end"
          >
            <ModuleTableColumnVisibilityButton table={table} />
            {permissions.canExport ? (
              <ModuleTableExportButton
                allRows={exportAllRows}
                columns={DiscountMaintenanceExportColumns}
                fileName="discount-maintenance"
                filteredRows={exportFilteredRows}
                isFiltered={hasActiveFilters}
                table={table}
                title="Discount Maintenance"
              />
            ) : (
              <span aria-hidden="true" />
            )}
            <ModuleTableResetButton className="px-2" isRefreshing={isRefreshing} onClick={onRefresh}>
              <span className="sr-only">Refresh</span>
            </ModuleTableResetButton>
          </div>
        </div>
      </ModuleTableToolbar>
    </div>
  );
}
