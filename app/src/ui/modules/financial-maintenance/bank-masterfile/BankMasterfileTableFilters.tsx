import {
  BankMasterfileExportColumns,
  BankMasterfileStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import type {
  BankMasterfileStatusFilter,
  BankMasterfileTableFiltersProps,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function BankMasterfileTableFilters({
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
}: BankMasterfileTableFiltersProps) {
  return (
    <ModuleTableToolbar
      className="min-w-0 !grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3"
      data-spotlight-id="bank-masterfile-filters"
    >
      <div
        data-spotlight-id="maintenance-table-filters"
        className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(13rem,1.35fr)_minmax(7rem,0.7fr)_auto]"
      >
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <ModuleTableSearch
            label="Search banks"
            value={query}
            onChange={onQueryChange}
            placeholder="Search by bank, account number, account code, or account title"
          />
        </div>
        <ModuleTableFilterSelect
          label="Status"
          value={statusFilter}
          options={[
            { label: "All", value: "" },
            ...BankMasterfileStatusOptions.map((status) => ({
              label: status,
              value: status,
            })),
          ]}
          onChange={(value) => onStatusFilterChange(value as BankMasterfileStatusFilter)}
        />
        <div
          data-spotlight-id="maintenance-table-options"
          className="grid w-full grid-cols-3 gap-2 sm:w-[10.75rem] sm:self-end"
        >
          <ModuleTableColumnVisibilityButton table={table} />
          {permissions.canExport ? (
            <ModuleTableExportButton
              allRows={exportAllRows}
              columns={BankMasterfileExportColumns}
              fileName="bank-masterfile"
              filteredRows={exportFilteredRows}
              isFiltered={hasActiveFilters}
              table={table}
              title="Bank Masterfile"
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
  );
}
