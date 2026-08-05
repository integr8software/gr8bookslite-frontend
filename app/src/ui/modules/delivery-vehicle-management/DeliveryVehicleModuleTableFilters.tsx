import type { Table } from "@tanstack/react-table";
import type {
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
  type ModuleTableExportColumn,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type DeliveryVehicleModuleTableFiltersProps = {
  config: DeliveryVehicleModuleConfig;
  exportAllRows: DeliveryVehicleModuleRecord[];
  exportFilteredRows: DeliveryVehicleModuleRecord[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  query: string;
  statusFilter: string;
  table: Table<DeliveryVehicleModuleRecord>;
  vehicleTypeFilter: string;
  vehicleTypeFilterOptions: readonly string[];
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: string) => void;
  onVehicleTypeFilterChange: (value: string) => void;
};

export function DeliveryVehicleModuleTableFilters({
  config,
  exportAllRows,
  exportFilteredRows,
  hasActiveFilters,
  isRefreshing,
  query,
  statusFilter,
  table,
  vehicleTypeFilter,
  vehicleTypeFilterOptions,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onVehicleTypeFilterChange,
}: DeliveryVehicleModuleTableFiltersProps) {
  const showVehicleTypeFilter =
    config.key === "delivery-vehicles" && vehicleTypeFilterOptions.length > 0;

  return (
    <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
      <div
        className={
          showVehicleTypeFilter
            ? "grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(13rem,1.4fr)_minmax(8rem,0.7fr)_minmax(10rem,0.8fr)]"
            : "grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(13rem,1.4fr)_minmax(8rem,0.7fr)]"
        }
      >
        <ModuleTableSearch
          label={`Search ${config.title}`}
          value={query}
          onChange={onQueryChange}
          placeholder={config.searchPlaceholder}
        />
        {showVehicleTypeFilter ? (
          <ModuleTableFilterSelect
            label="Vehicle Type"
            value={vehicleTypeFilter}
            onChange={onVehicleTypeFilterChange}
            options={[
              { label: "All", value: "" },
              ...vehicleTypeFilterOptions.map((vehicleType) => ({
                label: vehicleType,
                value: vehicleType,
              })),
            ]}
          />
        ) : null}
        <ModuleTableFilterSelect
          label="Status"
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={[
            { label: "All", value: "" },
            ...config.statuses.map((status) => ({
              label: status,
              value: status,
            })),
          ]}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
        <ModuleTableColumnVisibilityButton table={table} />
        <ModuleTableExportButton
          allRows={exportAllRows}
          columns={createDeliveryVehicleExportColumns(config)}
          fileName={config.key}
          filteredRows={exportFilteredRows}
          isFiltered={hasActiveFilters}
          table={table}
          title={config.title}
        />
        <ModuleTableResetButton className="px-2" isRefreshing={isRefreshing} onClick={onRefresh}>
          <span className="sr-only">Refresh</span>
        </ModuleTableResetButton>
      </div>
    </ModuleTableToolbar>
  );
}

function createDeliveryVehicleExportColumns(
  config: DeliveryVehicleModuleConfig,
): ModuleTableExportColumn<DeliveryVehicleModuleRecord>[] {
  return [
    ...(config.hideReferenceColumn
      ? []
      : ([
          { header: "Reference", id: "code", value: "code" },
        ] satisfies ModuleTableExportColumn<DeliveryVehicleModuleRecord>[])),
    {
      header: config.noun.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      id: "name",
      value: "name",
    },
    ...config.tableFieldKeys.map<ModuleTableExportColumn<DeliveryVehicleModuleRecord>>(
      (fieldKey) => {
        const field = config.fields.find((item) => item.key === fieldKey);

        return {
          header: field?.label ?? fieldKey,
          id: fieldKey,
          value: (record) => {
            const value = record.fields[fieldKey] ?? "";

            return value && field?.unitSuffix ? `${value} ${field.unitSuffix}` : value;
          },
        };
      },
    ),
    { header: "Status", id: "status", value: "status" },
    { header: "Created By", id: "createdBy", value: "createdBy" },
    { header: "Date Created", id: "createdAt", value: "createdAt" },
    { header: "Updated By", id: "updatedBy", value: "updatedBy" },
    { header: "Date Modified", id: "updatedAt", value: "updatedAt" },
  ];
}
