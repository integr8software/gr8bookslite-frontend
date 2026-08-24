import {
  PaymentTypeExportColumns,
  PaymentTypeStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/payment-type/PaymentTypeConstants";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import type {
  PaymentTypeClassification,
  PaymentTypeStatusFilter,
  PaymentTypeTableFiltersProps,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";

export function PaymentTypeFilters({
  exportAllRows,
  exportFilteredRows,
  hasActiveFilters,
  isRefreshing,
  permissions,
  searchTerm,
  statusFilter,
  table,
  typeFilter,
  typeFilterOptions,
  onRefresh,
  onSearchTermChange,
  onStatusFilterChange,
  onTypeFilterChange,
}: PaymentTypeTableFiltersProps) {
  return (
    <ModuleTableToolbar
      className="min-w-0 !grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3"
      data-spotlight-id="payment-type-filters"
    >
      <div
        data-spotlight-id="maintenance-table-filters"
        className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid-cols-[minmax(13rem,1.35fr)_minmax(8rem,0.85fr)_minmax(7rem,0.7fr)_auto]"
      >
        <div className="col-span-1 sm:col-span-3 lg:col-span-1">
          <ModuleTableSearch
            label="Search payment types"
            value={searchTerm}
            onChange={onSearchTermChange}
            placeholder="Search by name, category, description, or status"
          />
        </div>
        <ModuleTableFilterSelect
          label="Category"
          value={typeFilter}
          options={[
            { label: "All", value: "" },
            ...typeFilterOptions.map((typeOption) => ({
              label: typeOption,
              value: typeOption,
            })),
          ]}
          onChange={(value) => onTypeFilterChange(value as "" | PaymentTypeClassification)}
        />
        <ModuleTableFilterSelect
          label="Status"
          value={statusFilter}
          options={[
            { label: "All", value: "" },
            ...PaymentTypeStatusOptions.map((status) => ({
              label: status,
              value: status,
            })),
          ]}
          onChange={(value) => onStatusFilterChange(value as PaymentTypeStatusFilter)}
        />
        <div
          data-spotlight-id="maintenance-table-options"
          className="grid w-full grid-cols-3 gap-2 sm:w-[10.75rem] sm:self-end"
        >
          <ModuleTableColumnVisibilityButton table={table} />
          {permissions.canExport ? (
            <ModuleTableExportButton
              allRows={exportAllRows}
              columns={PaymentTypeExportColumns}
              fileName="payment-type"
              filteredRows={exportFilteredRows}
              isFiltered={hasActiveFilters}
              table={table}
              title="Payment Type"
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
