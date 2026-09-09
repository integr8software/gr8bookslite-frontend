"use client";

import { useCallback, useState } from "react";
import { ProjectMaintenanceStatuses } from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import { useProjectMaintenanceListPage } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenanceListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/useMaintenanceAddDrawerSpotlight";
import type { ProjectMaintenanceDrawerState } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ProjectMaintenanceDrawer } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceDrawer";
import { ProjectMaintenanceHeader } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceHeader";
import { ProjectMaintenanceStatisticCards } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceStatisticCards";
import { ProjectMaintenanceTable } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceTable";

export function ProjectMaintenanceListPage() {
  const page = useProjectMaintenanceListPage();
  const [drawerState, setDrawerState] = useState<ProjectMaintenanceDrawerState>(null);
  const [drawerVersion, setDrawerVersion] = useState(0);
  const closeDrawer = useCallback(() => setDrawerState(null), []);
  const openAddDrawer = useCallback(() => {
    setDrawerVersion((version) => version + 1);
    setDrawerState({ mode: "add" });
  }, []);
  useMaintenanceAddDrawerSpotlight(() => {
    if (page.permissions.canCreate) {
      openAddDrawer();
    }
  }, closeDrawer);
  const hasActiveFilters = page.query.trim().length > 0 || page.statusFilter !== "Active";

  return (
    <section className="grid gap-5">
      <ProjectMaintenanceHeader onAdd={openAddDrawer} permissions={page.permissions} />
      <ProjectMaintenanceStatisticCards statistics={page.statistics} isLoading={page.isLoading} />
      <ProjectMaintenanceTable
        filteredProjects={page.filteredProjects}
        hasActiveFilters={hasActiveFilters}
        isLoading={page.isLoading}
        isRefreshing={page.isRefreshing}
        lastSyncedAt={page.lastSyncedAt}
        permissions={page.permissions}
        projects={page.projects}
        query={page.query}
        statusFilter={page.statusFilter}
        onEditProject={(project) => setDrawerState({ mode: "edit", project })}
        onQueryChange={page.setQuery}
        onRefresh={page.refreshProjects}
        onStatusFilterChange={page.setStatusFilter}
        onToggleStatus={page.setPendingStatusProject}
        onViewProject={(project) => setDrawerState({ mode: "view", project })}
      />
      <ProjectMaintenanceDrawer
        key={`${drawerState?.mode ?? "closed"}-${drawerState?.project?.id ?? "new"}-${drawerVersion}`}
        initialValues={drawerState?.initialValues}
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        onClose={closeDrawer}
        project={drawerState?.project}
      />
      <AppDialog
        isOpen={Boolean(page.pendingStatusProject)}
        isPending={page.isMutating}
        title={page.pendingStatusProject?.status === ProjectMaintenanceStatuses.Active ? "Deactivate project?" : "Activate project?"}
        description={
          page.pendingStatusProject?.status === ProjectMaintenanceStatuses.Active
            ? `${page.pendingStatusProject.projectName} will remain in history and references, but will no longer be active for normal selection.`
            : `${page.pendingStatusProject?.projectName ?? "This project"} will be available for normal selection again.`
        }
        confirmLabel={page.pendingStatusProject?.status === ProjectMaintenanceStatuses.Active ? "Deactivate" : "Activate"}
        tone={page.pendingStatusProject?.status === ProjectMaintenanceStatuses.Active ? "deactivate" : "activate"}
        onCancel={() => page.setPendingStatusProject(null)}
        onConfirm={page.confirmProjectStatusChange}
      />
    </section>
  );
}
