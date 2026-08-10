"use client";

import { useCallback, useState } from "react";
import { useServicesMaintenanceListPage } from "@/app/src/hooks/modules/financial-maintenance/services-maintenance/useServicesMaintenanceListPage";
import type { ServicesMaintenanceDrawerState } from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ServicesMaintenanceDrawer } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceDrawer";
import { ServicesMaintenanceHeader } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceHeader";
import { ServicesMaintenanceImportDialog } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceImportDialog";
import { ServicesMaintenanceStatisticCards } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceStatisticCards";
import { ServicesMaintenanceTable } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTable";

export function ServicesMaintenanceListPage() {
  const page = useServicesMaintenanceListPage();
  const [drawerState, setDrawerState] = useState<ServicesMaintenanceDrawerState>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [drawerVersion, setDrawerVersion] = useState(0);
  const closeDrawer = useCallback(() => setDrawerState(null), []);
  const openAddDrawer = useCallback(() => {
    setDrawerVersion((version) => version + 1);
    setDrawerState({ mode: "add" });
  }, []);
  const hasActiveFilters = page.query.trim().length > 0 || page.statusFilter !== "";

  return (
    <section className="grid gap-5">
      <ServicesMaintenanceHeader onAdd={openAddDrawer} onImport={() => setIsImportOpen(true)} permissions={page.permissions} />
      <ServicesMaintenanceStatisticCards isLoading={page.isLoading} statistics={page.statistics} />
      <ServicesMaintenanceTable
        filteredServices={page.filteredServices}
        hasActiveFilters={hasActiveFilters}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        permissions={page.permissions}
        query={page.query}
        services={page.services}
        statusFilter={page.statusFilter}
        onEditService={(service) => setDrawerState({ mode: "edit", service })}
        onQueryChange={page.setQuery}
        onRefresh={page.refreshServices}
        onStatusFilterChange={page.setStatusFilter}
        onToggleStatus={page.setPendingStatusService}
        onViewService={(service) => setDrawerState({ mode: "view", service })}
      />
      <ServicesMaintenanceDrawer
        key={`${drawerState?.mode ?? "closed"}-${drawerState?.service?.id ?? "new"}-${drawerVersion}`}
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        onClose={closeDrawer}
        service={drawerState?.service}
      />
      {page.permissions.canImport ? (
        <ServicesMaintenanceImportDialog
          existingServices={page.services}
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportServices={page.addServices}
        />
      ) : null}
      <AppDialog
        isOpen={Boolean(page.pendingStatusService)}
        isPending={page.isMutating}
        title={page.pendingStatusService?.status === "Active" ? "Inactivate service?" : "Activate service?"}
        description={
          page.pendingStatusService?.status === "Active"
            ? `${page.pendingStatusService.serviceName} will remain in history and references, but will no longer be active for normal selection.`
            : `${page.pendingStatusService?.serviceName ?? "This service"} will be available for normal selection again.`
        }
        confirmLabel={page.pendingStatusService?.status === "Active" ? "Inactivate" : "Activate"}
        tone={page.pendingStatusService?.status === "Active" ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusService(null)}
        onConfirm={page.confirmServiceStatusChange}
      />
    </section>
  );
}
