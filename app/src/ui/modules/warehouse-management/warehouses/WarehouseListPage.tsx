"use client";

import { Building2, CheckCircle2, CirclePause, Grid2X2, List, Plus, Warehouse } from "lucide-react";
import { useWarehouseListPage } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouseListPage";
import { WarehouseExportColumns, WarehouseStatusOptions } from "@/app/src/constants/modules/warehouse-management/warehouses/WarehouseConstants";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTableSyncStatus } from "@/app/src/ui/shared/module/ModuleTableSyncStatus";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableExportButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseTable } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseTable";
import { WarehouseCardGrid } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseCardGrid";
import { WarehouseDrawer } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseDrawer";
import { useState } from "react";
import type { DrawerState, WarehouseViewMode } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";

export function WarehouseListPage() {
  const page = useWarehouseListPage();
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const [viewMode, setViewMode] = useState<WarehouseViewMode>("list");
  const hasActiveFilters = page.query.trim().length > 0 || page.branchFilter !== "All" || page.statusFilter !== "Active";
  useMaintenanceAddDrawerSpotlight(
    () => setDrawerState({ mode: "add" }),
    () => setDrawerState(null),
  );
  const toolbar = (
    <ModuleTableToolbar className="!grid-cols-1 !gap-2 !border-0 !p-3 !shadow-none md:!grid-cols-[minmax(0,1fr)_auto]">
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(22rem,2fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
        <ModuleTableSearch
          className="sm:col-span-2 xl:col-span-1"
          label="Search warehouses"
          value={page.query}
          onChange={page.handleQueryChange}
          placeholder="Search warehouse name, code, or location"
        />
        <ModuleTableFilterSelect
          label="Branch"
          value={page.branchFilter}
          options={[{ label: "All branches", value: "All" }, ...page.branchFilterOptions.map((branch) => ({ label: branch, value: branch }))]}
          onChange={page.setBranchFilter}
        />
        <ModuleTableFilterSelect
          label="Status"
          value={page.statusFilter}
          options={[{ label: "All statuses", value: "All" }, ...WarehouseStatusOptions.map((status) => ({ label: status, value: status }))]}
          onChange={page.setStatusFilter}
        />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <ModuleTableExportButton
          className="w-12 min-w-12 shrink-0"
          allRows={page.tableWarehouses}
          columns={WarehouseExportColumns}
          fileName="warehouses"
          filteredRows={page.filteredWarehouses}
          isFiltered={hasActiveFilters}
          label="Export warehouses"
          table={page.table}
          title="Warehouses"
        />
        <ModuleTableColumnVisibilityButton className="w-12 min-w-12 shrink-0" table={page.table} />
        <div className="flex h-12 shrink-0 rounded-lg border border-darknavy/10 bg-white p-1" role="group" aria-label="Warehouse view">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            aria-label="List view"
            className={`grid h-10 w-10 place-items-center rounded-md transition ${viewMode === "list" ? "bg-skyblue text-[var(--skyblue-contrast)]" : "text-darknavy/55 hover:bg-skyblue/10 hover:text-darknavy"}`}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
            className={`grid h-10 w-10 place-items-center rounded-md transition ${viewMode === "grid" ? "bg-skyblue text-[var(--skyblue-contrast)]" : "text-darknavy/55 hover:bg-skyblue/10 hover:text-darknavy"}`}
          >
            <Grid2X2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="w-12 min-w-12 shrink-0">
          <ModuleTableResetButton
            className="!w-12 !px-0"
            isRefreshing={page.isRefreshing}
            onClick={hasActiveFilters ? page.resetFilters : page.refreshWarehouses}
          >
            {hasActiveFilters ? "Reset filters" : "Refresh"}
          </ModuleTableResetButton>
        </div>
      </div>
    </ModuleTableToolbar>
  );

  return (
    <section className="grid min-h-[calc(100vh-8rem)] content-start gap-5 pb-2">
      <ModuleHeader
        variant="plain"
        titleAs="h1"
        title="Warehouses"
        description="Manage warehouse locations, stock visibility, and operations."
        eyebrow={
          <>
            <Warehouse className="h-3.5 w-3.5" aria-hidden="true" />
            Inventory maintenance
          </>
        }
        actions={
          <button type="button" onClick={() => setDrawerState({ mode: "add" })} className={moduleHeaderActionClassNames.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Warehouse
          </button>
        }
      />

      <ModuleStatisticCards
        isLoading={page.isLoading}
        className="xl:grid-cols-4"
        items={[
          {
            helper: "All warehouse records",
            icon: Warehouse,
            label: "Total Warehouses",
            value: page.statistics.totalWarehouses,
          },
          {
            helper: "Available locations",
            icon: CheckCircle2,
            label: "Active Warehouses",
            tone: "emerald",
            value: page.statistics.activeWarehouses,
          },
          {
            helper: "Unavailable locations",
            icon: CirclePause,
            label: "Inactive",
            tone: "amber",
            value: page.statistics.inactiveWarehouses,
          },
          {
            helper: "Available to every branch",
            icon: Building2,
            label: "All-Branch",
            tone: "cyan",
            value: page.tableWarehouses.filter((warehouse) => warehouse.branchAvailabilityMode === "All Branches").length,
          },
        ]}
      />

      {viewMode === "list" ? (
        <WarehouseTable
          isLoading={page.isLoading}
          lastSyncedAt={page.lastSyncedAt}
          setPendingDeleteWarehouse={page.setPendingDeleteWarehouse}
          onEditWarehouse={(warehouse) => setDrawerState({ mode: "edit", warehouse })}
          onViewWarehouse={(warehouse) => setDrawerState({ mode: "view", warehouse })}
          table={page.table}
          toolbar={toolbar}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-darknavy/8 bg-white shadow-sm shadow-darknavy/5">
          <ModuleTableSyncStatus isSyncing={page.isRefreshing} lastSyncedAt={page.lastSyncedAt} tableTitle="Warehouses" />
          <div className="border-b border-darknavy/8">{toolbar}</div>
          <div className="p-3">
            <WarehouseCardGrid
              isLoading={page.isLoading}
              lastSyncedAt={page.lastSyncedAt}
              setPendingDeleteWarehouse={page.setPendingDeleteWarehouse}
              onEditWarehouse={(warehouse) => setDrawerState({ mode: "edit", warehouse })}
              onViewWarehouse={(warehouse) => setDrawerState({ mode: "view", warehouse })}
              table={page.table}
            />
          </div>
        </div>
      )}
      {drawerState ? <WarehouseDrawer isOpen mode={drawerState.mode} onClose={() => setDrawerState(null)} warehouse={drawerState.warehouse} /> : null}

      <AppDialog
        isOpen={Boolean(page.pendingDeleteWarehouse)}
        isPending={page.isMutating}
        title={`Set warehouse ${page.pendingDeleteWarehouse?.status === "Inactive" ? "active" : "inactive"}?`}
        description={
          page.pendingDeleteWarehouse?.status === "Inactive"
            ? `${page.pendingDeleteWarehouse.name} will become available for normal selection.`
            : `${page.pendingDeleteWarehouse?.name ?? "The selected warehouse"} will remain in history and references, but will no longer be active for normal selection.`
        }
        confirmLabel={page.pendingDeleteWarehouse?.status === "Inactive" ? "Set Active" : "Set Inactive"}
        tone={page.pendingDeleteWarehouse?.status === "Inactive" ? "activate" : "deactivate"}
        onCancel={() => page.setPendingDeleteWarehouse(null)}
        onConfirm={page.handleConfirmDelete}
      />
    </section>
  );
}
