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
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: string) => void;
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
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
}: DeliveryVehicleModuleTableFiltersProps) {
  return (
    <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(13rem,1.4fr)_minmax(8rem,0.7fr)]">
        <ModuleTableSearch
          label={`Search ${config.title}`}
          value={query}
          onChange={onQueryChange}
          placeholder={config.searchPlaceholder}
        />
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
    { header: "Reference", id: "code", value: "code" },
    {
      header: config.noun.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      id: "name",
      value: "name",
    },
    ...config.tableFieldKeys.map<ModuleTableExportColumn<DeliveryVehicleModuleRecord>>(
      (fieldKey) => ({
        header: config.fields.find((field) => field.key === fieldKey)?.label ?? fieldKey,
        id: fieldKey,
        value: (record) => record.fields[fieldKey] ?? "",
      }),
    ),
    { header: "Status", id: "status", value: "status" },
    { header: "Created By", id: "createdBy", value: "createdBy" },
    { header: "Date Created", id: "createdAt", value: "createdAt" },
    { header: "Updated By", id: "updatedBy", value: "updatedBy" },
    { header: "Date Modified", id: "updatedAt", value: "updatedAt" },
  ];
}
