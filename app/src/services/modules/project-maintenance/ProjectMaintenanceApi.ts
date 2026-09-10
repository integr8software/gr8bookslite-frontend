import {
  projectMaintenanceControllerCreateV1,
  projectMaintenanceControllerFindAllV1,
  projectMaintenanceControllerUpdateV1,
} from "@/app/src/generated/api/project-maintenance/project-maintenance";
import type {
  CreateProjectMaintenanceDto,
  CreateProjectMaintenanceDtoStatus,
  ProjectMaintenanceResponseDto,
  ProjectMaintenanceResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ProjectMaintenance,
  ProjectMaintenanceFormValues,
  ProjectMaintenanceListResult,
  ProjectMaintenanceLookupOption,
  ProjectMaintenanceStatus,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

export async function fetchProjects(): Promise<ProjectMaintenanceListResult> {
  const response = await projectMaintenanceControllerFindAllV1();

  return {
    projects: response.projects.map(mapApiProject),
    statistics: response.statistics,
    permissions: {
      ...response.permissions,
      canImport: response.permissions.canImport ?? false,
    },
  };
}

export async function fetchProjectOptions(): Promise<ProjectMaintenanceLookupOption[]> {
  const response = await ApiClient.get<{
    projects: Array<{
      id: string;
      projectCode?: string | null;
      projectName: string;
      name?: string | null;
      description?: string | null;
      status: ProjectMaintenanceResponseDtoStatus;
    }>;
  }>("/maintenance/project-maintenance/options");

  return response.data.projects.map((project) => ({
    id: project.id,
    projectId: project.id,
    projectCode: project.projectCode ?? "",
    projectName: project.projectName,
    name: project.name?.trim() || project.projectName,
    label: project.projectCode ?? "",
    value: project.projectName,
    description: project.description ?? "",
    status: mapStatusFromApi(project.status),
  }));
}

export async function createProject(values: ProjectMaintenanceFormValues): Promise<ProjectMaintenance> {
  const response = await projectMaintenanceControllerCreateV1(toApiProjectPayload(values));

  return mapApiProject(response.project);
}

export async function updateProject(project: ProjectMaintenance): Promise<ProjectMaintenance> {
  const response = await projectMaintenanceControllerUpdateV1(project.id, toApiProjectPayload(project));

  return mapApiProject(response.project);
}

function mapApiProject(project: ProjectMaintenanceResponseDto): ProjectMaintenance {
  return {
    id: project.id,
    projectCode: project.projectCode ?? "",
    projectName: project.projectName,
    description: project.description ?? "",
    status: mapStatusFromApi(project.status),
    createdBy: project.createdBy ?? "-",
    createdAt: project.createdAt,
    updatedBy: project.updatedBy,
    updatedAt: project.updatedAt,
  };
}

function toApiProjectPayload(project: ProjectMaintenance | ProjectMaintenanceFormValues): CreateProjectMaintenanceDto {
  return {
    projectCode: project.projectCode.trim(),
    projectName: project.projectName.trim(),
    description: project.description.trim(),
    status: mapStatusToApi(project.status),
  };
}

function mapStatusFromApi(value: ProjectMaintenanceResponseDtoStatus): ProjectMaintenanceStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ProjectMaintenanceStatus): CreateProjectMaintenanceDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
