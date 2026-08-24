import {
  DefaultAccountExportColumns,
  DefaultAccountStatusOptions,
  DefaultAccountTypeFilterOptions,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import type {
  DefaultAccountStatusFilter,
  DefaultAccountTableFiltersProps,
  DefaultAccountTypeFilter,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { Tabs } from "@/app/src/ui/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsControls";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function DefaultAccountTableFilters({
  exportAllRows,
  exportFilteredRows,
  hasActiveFilters,
  isRefreshing,
  permissions,
  query,
  statusFilter,
  table,
  typeFilter,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onTypeFilterChange,
}: DefaultAccountTableFiltersProps) {
  const typeFilterLabels = DefaultAccountTypeFilterOptions.map((option) => option.label);
  const activeTypeFilterLabel =
    DefaultAccountTypeFilterOptions.find((option) => option.value === typeFilter)?.label ?? DefaultAccountTypeFilterOptions[0].label;

  return (
    <div>
      <div className="border-b border-darknavy/10 px-3">
        <Tabs
          value={activeTypeFilterLabel}
          options={typeFilterLabels}
          onChange={(label) => {
            const selectedOption = DefaultAccountTypeFilterOptions.find((option) => option.label === label);

            onTypeFilterChange((selectedOption?.value ?? "") as DefaultAccountTypeFilter);
          }}
        />
      </div>
      <ModuleTableToolbar
        className="min-w-0 !grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3"
        data-spotlight-id="default-account-filters"
      >
        <div
          data-spotlight-id="maintenance-table-filters"
          className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(13rem,1.35fr)_minmax(7rem,0.7fr)_auto]"
        >
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <ModuleTableSearch
              label="Search default accounts"
              value={query}
              onChange={onQueryChange}
              placeholder="Search by name, description, type, status, or account"
            />
          </div>
          <ModuleTableFilterSelect
            label="Status"
            value={statusFilter}
            options={[
              { label: "All Status", value: "" },
              ...DefaultAccountStatusOptions.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            onChange={(value) => onStatusFilterChange(value as DefaultAccountStatusFilter)}
          />
          <div
            data-spotlight-id="maintenance-table-options"
            className="grid w-full grid-cols-3 gap-2 sm:w-[10.75rem] sm:self-end"
          >
            <ModuleTableColumnVisibilityButton table={table} />
            {permissions.canExport ? (
              <ModuleTableExportButton
                allRows={exportAllRows}
                columns={DefaultAccountExportColumns}
                fileName="default-account"
                filteredRows={exportFilteredRows}
                isFiltered={hasActiveFilters}
                table={table}
                title="Default Accounts"
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
