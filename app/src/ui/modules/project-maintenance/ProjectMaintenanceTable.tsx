"use client";

import { Search } from "lucide-react";
import { ProjectMaintenanceTablePaginationStorageKey } from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import { getProjectMaintenanceTableMinWidthClassName } from "@/app/src/data/modules/project-maintenance/ProjectMaintenanceData";
import { useProjectMaintenanceTable } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenanceTable";
import type { ProjectMaintenanceTableProps } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ProjectMaintenanceTableFilters } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceTableFilters";
import { ProjectMaintenanceTableRow } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceTableRow";

export function ProjectMaintenanceTable({
  filteredProjects,
  hasActiveFilters,
  isLoading,
  isRefreshing,
  lastSyncedAt,
  permissions,
  projects,
  query,
  statusFilter,
  onEditProject,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onToggleStatus,
  onViewProject,
}: ProjectMaintenanceTableProps) {
  const table = useProjectMaintenanceTable(filteredProjects);
  const tableMinWidthClassName = getProjectMaintenanceTableMinWidthClassName(table.getVisibleLeafColumns().length);

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <ModuleTable
        variant="embedded"
        emptyDescription="Add a project record to start managing project references."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No Project Records Found"
        isLoading={isLoading}
        isSyncing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        minWidthClassName={`${tableMinWidthClassName} table-fixed`}
        paginationStorageKey={ProjectMaintenanceTablePaginationStorageKey}
        table={table}
        tableTitle="Project Records"
        toolbar={
          <ProjectMaintenanceTableFilters
            exportAllRows={projects}
            exportFilteredRows={filteredProjects}
            hasActiveFilters={hasActiveFilters}
            isRefreshing={isRefreshing}
            permissions={permissions}
            query={query}
            statusFilter={statusFilter}
            table={table}
            onQueryChange={onQueryChange}
            onRefresh={onRefresh}
            onStatusFilterChange={onStatusFilterChange}
          />
        }
        renderRow={(row) => (
          <ProjectMaintenanceTableRow
            key={row.id}
            row={row}
            permissions={permissions}
            onEditProject={onEditProject}
            onToggleStatus={onToggleStatus}
            onViewProject={onViewProject}
          />
        )}
      />
    </div>
  );
}
