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
import type {
  ProjectMaintenance,
  ProjectMaintenanceFormValues,
  ProjectMaintenanceListResult,
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
    projectName: project.projectName,
    projectDescription: project.projectDescription ?? "",
    status: mapStatusFromApi(project.status),
    createdBy: project.createdBy ?? "-",
    createdAt: project.createdAt,
    updatedBy: project.updatedBy,
    updatedAt: project.updatedAt,
  };
}

function toApiProjectPayload(project: ProjectMaintenance | ProjectMaintenanceFormValues): CreateProjectMaintenanceDto {
  return {
    projectName: project.projectName.trim(),
    projectDescription: project.projectDescription.trim(),
    status: mapStatusToApi(project.status),
  };
}

function mapStatusFromApi(value: ProjectMaintenanceResponseDtoStatus): ProjectMaintenanceStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: ProjectMaintenanceStatus): CreateProjectMaintenanceDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}
