"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
  createProject,
  fetchNextProjectCode,
  fetchProjectOptions,
  fetchProjects,
  updateProject,
} from "@/app/src/services/modules/project-maintenance/ProjectMaintenanceApi";
import { ProjectMaintenanceQueryKeys } from "@/app/src/services/modules/project-maintenance/ProjectMaintenanceQueryKeys";
import type {
  ProjectMaintenance,
  ProjectMaintenanceFormValues,
  ProjectMaintenancePermissions,
  ProjectMaintenanceStatistics,
  ProjectMaintenanceStoreOptions,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

type ProjectMaintenanceStoreState = {
  projects: ProjectMaintenance[];
  addProject: (project: ProjectMaintenanceFormValues) => Promise<ProjectMaintenance>;
  updateProject: (project: ProjectMaintenance) => Promise<ProjectMaintenance>;
  permissions: ProjectMaintenancePermissions;
  statistics: ProjectMaintenanceStatistics;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
  refreshProjects: () => void;
};

const EmptyProjectPermissions: ProjectMaintenancePermissions = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canExport: false,
  canImport: false,
};

const ReservedRoleProjectPermissions: ProjectMaintenancePermissions = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canExport: true,
  canImport: false,
};

const EmptyProjectStatistics: ProjectMaintenanceStatistics = {
  totalProjects: 0,
  activeProjects: 0,
  inactiveProjects: 0,
};

export function useProjectMaintenanceStore<TSelected = ProjectMaintenanceStoreState>(
  selector?: (state: ProjectMaintenanceStoreState) => TSelected,
  options: ProjectMaintenanceStoreOptions = {},
) {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const projectsQuery = useQuery({
    queryKey: ProjectMaintenanceQueryKeys.projects(),
    queryFn: fetchProjects,
    refetchOnMount: options.refetchOnMount,
    retry: false,
  });
  const refreshProjects = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ProjectMaintenanceQueryKeys.all(),
    });
  }, [queryClient]);

  const addProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ProjectMaintenanceQueryKeys.all(),
      });
      toast.success("Project created successfully.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create project record. Please try again.");
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: (_, updatedProject) => {
      const previousProject = projectsQuery.data?.projects.find((project) => project.id === updatedProject.id);
      const didStatusChange = previousProject && previousProject.status !== updatedProject.status;

      void queryClient.invalidateQueries({
        queryKey: ProjectMaintenanceQueryKeys.all(),
      });
      toast.success(
        didStatusChange
          ? `Project ${updatedProject.status === "Active" ? "activated" : "deactivated"} successfully.`
          : "Project updated successfully.",
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update project record. Please try again.");
    },
  });

  const state = useMemo<ProjectMaintenanceStoreState>(() => {
    const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
    const hasReservedRoleAccess = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

    return {
      projects: projectsQuery.data?.projects ?? [],
      permissions: hasReservedRoleAccess ? ReservedRoleProjectPermissions : (projectsQuery.data?.permissions ?? EmptyProjectPermissions),
      statistics: projectsQuery.data?.statistics ?? EmptyProjectStatistics,
      addProject: (project) => addProjectMutation.mutateAsync(project),
      updateProject: (project) => updateProjectMutation.mutateAsync(project),
      isLoading: projectsQuery.isLoading,
      isRefreshing: projectsQuery.isFetching && !projectsQuery.isLoading,
      lastSyncedAt: projectsQuery.dataUpdatedAt,
      isMutating: addProjectMutation.isPending || updateProjectMutation.isPending,
      refreshProjects,
    };
  }, [
    addProjectMutation,
    authProfileQuery.data,
    projectsQuery.data,
    projectsQuery.dataUpdatedAt,
    projectsQuery.isFetching,
    projectsQuery.isLoading,
    refreshProjects,
    updateProjectMutation,
  ]);

  return selector ? selector(state) : (state as TSelected);
}

export function useProjectMaintenanceLookup() {
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled: activeCompanyId !== null,
    queryFn: fetchProjectOptions,
    queryKey: ProjectMaintenanceQueryKeys.options(activeCompanyId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectMaintenanceNextCode(enabled = true) {
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled: enabled && activeCompanyId !== null,
    queryFn: fetchNextProjectCode,
    queryKey: ProjectMaintenanceQueryKeys.nextCode(activeCompanyId),
    retry: false,
    staleTime: 0,
  });
}
