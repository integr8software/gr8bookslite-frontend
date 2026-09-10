import {
  CollectionTypeExportColumns,
  CollectionTypeStatusOptions,
  CollectionTypeTypeFilterOptions,
} from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import type {
  CollectionTypeStatusFilter,
  CollectionTypeTableFiltersProps,
  CollectionTypeTypeFilter,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

const CollectionTypeTabs: readonly ModuleTabItem<CollectionTypeTypeFilter>[] = CollectionTypeTypeFilterOptions.map((option) => ({
  id: option.value as CollectionTypeTypeFilter,
  label: option.label,
}));

export function CollectionTypeTableFilters({
  exportAllRows,
  exportFilteredRows,
  hasActiveFilters,
  isRefreshing,
  permissions,
  query,
  statusFilter,
  table,
  typeFilter,
  showTypeTabs = true,
  title = "Collection Types",
  exportFileName = "collection-type",
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onTypeFilterChange,
}: CollectionTypeTableFiltersProps) {
  return (
    <div>
      {showTypeTabs ? (
        <div className="border-b border-darknavy/10 px-3 py-2">
          <ModuleTabs
            activeTab={typeFilter}
            ariaLabel="Collection type type tabs"
            onTabChange={onTypeFilterChange}
            tabs={CollectionTypeTabs}
            variant="underline"
          />
        </div>
      ) : null}
      <ModuleTableToolbar
        className="min-w-0 !grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3"
        data-spotlight-id="collection-type-filters"
      >
        <div
          data-spotlight-id="maintenance-table-filters"
          className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(13rem,1.35fr)_minmax(7rem,0.7fr)_auto]"
        >
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <ModuleTableSearch
              label="Search collection types"
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
              ...CollectionTypeStatusOptions.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            onChange={(value) => onStatusFilterChange(value as CollectionTypeStatusFilter)}
          />
          <div
            data-spotlight-id="maintenance-table-options"
            className="grid w-full grid-cols-3 gap-2 sm:w-[10.75rem] sm:self-end"
          >
            <ModuleTableColumnVisibilityButton table={table} />
            {permissions.canExport ? (
              <ModuleTableExportButton
                allRows={exportAllRows}
                columns={CollectionTypeExportColumns}
                fileName={exportFileName}
                filteredRows={exportFilteredRows}
                isFiltered={hasActiveFilters}
                table={table}
                title={title}
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
