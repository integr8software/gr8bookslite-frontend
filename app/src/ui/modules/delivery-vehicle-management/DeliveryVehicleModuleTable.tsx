"use client";

import { Search } from "lucide-react";
import type {
  DeliveryVehicleModuleConfig,
  DeliveryVehicleModuleRecord,
} from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { DeliveryVehicleModuleTableFilters } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleTableFilters";
import { DeliveryVehicleModuleTableRow } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleTableRow";
import type { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";

type DeliveryVehicleModuleTableProps = {
  config: DeliveryVehicleModuleConfig;
  hasActiveFilters: boolean;
  page: ReturnType<typeof useDeliveryVehicleModuleListPage>;
  paginationKey: string;
  onAdvanceRecord: (record: DeliveryVehicleModuleRecord) => void;
  onEditRecord: (record: DeliveryVehicleModuleRecord) => void;
  onViewRecord: (record: DeliveryVehicleModuleRecord) => void;
};

export function DeliveryVehicleModuleTable({
  config,
  hasActiveFilters,
  page,
  paginationKey,
  onAdvanceRecord,
  onEditRecord,
  onViewRecord,
}: DeliveryVehicleModuleTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <ModuleTable
        variant="embedded"
        paginationStorageKey={paginationKey}
        table={page.table}
        tableTitle={config.title}
        minWidthClassName="min-w-[82rem] table-fixed"
        emptyTitle={`No ${config.noun} records found`}
        emptyDescription={
          hasActiveFilters
            ? "Try clearing one or more filters."
            : `Add the first ${config.noun} to this workspace.`
        }
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        isSyncing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        toolbar={
          <DeliveryVehicleModuleTableFilters
            config={config}
            exportAllRows={page.records}
            exportFilteredRows={page.filteredRecords}
            hasActiveFilters={hasActiveFilters}
            isRefreshing={page.isRefreshing}
            query={page.query}
            statusFilter={page.statusFilter}
            table={page.table}
            onQueryChange={page.setQuery}
            onRefresh={page.refreshRecords}
            onStatusFilterChange={page.setStatusFilter}
          />
        }
        renderRow={(row) => (
          <DeliveryVehicleModuleTableRow
            key={row.id}
            allowWorkflowAction={config.key === "vehicle-repair-maintenance"}
            row={row}
            onAdvanceRecord={onAdvanceRecord}
            onEditRecord={onEditRecord}
            onViewRecord={onViewRecord}
          />
        )}
      />
    </div>
  );
}
