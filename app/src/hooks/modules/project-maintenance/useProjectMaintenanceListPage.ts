"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useProjectMaintenanceStore } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenance";
import type {
  ProjectMaintenance,
  ProjectMaintenanceStatusFilter,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

export function useProjectMaintenanceListPage() {
  const { isLoading, isMutating, isRefreshing, lastSyncedAt, permissions, projects, refreshProjects, statistics, updateProject } =
    useProjectMaintenanceStore();
  const [statusFilter, setStatusFilter] = useState<ProjectMaintenanceStatusFilter>("Active");
  const [query, setQuery] = useState("");
  const [pendingStatusProject, setPendingStatusProject] = useState<ProjectMaintenance | null>(null);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return projects.filter((project) => {
      if (statusFilter && project.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [project.projectName, project.projectDescription, project.status].join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [projects, query, statusFilter]);

  function resetFilters() {
    setStatusFilter("Active");
    setQuery("");
  }

  function confirmProjectStatusChange() {
    if (!pendingStatusProject) {
      return;
    }

    return updateProject({
      ...pendingStatusProject,
      status: pendingStatusProject.status === "Active" ? "Inactive" : "Active",
    })
      .then(() => {
        setPendingStatusProject(null);
      })
      .catch(() => undefined);
  }

  return {
    confirmProjectStatusChange,
    filteredProjects,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    pendingStatusProject,
    permissions,
    projects,
    query,
    refreshProjects,
    resetFilters,
    setPendingStatusProject,
    setQuery,
    setStatusFilter,
    statistics,
    statusFilter,
  };
}
