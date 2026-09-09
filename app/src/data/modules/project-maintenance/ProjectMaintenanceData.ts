import type {
  ProjectMaintenance,
  ProjectMaintenanceFormValues,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

export const ProjectMaintenanceInitialFormValues: ProjectMaintenanceFormValues = {
  projectName: "",
  projectDescription: "",
  status: "Active",
};

export function createProjectMaintenanceFormValues(project: ProjectMaintenance): ProjectMaintenanceFormValues {
  return {
    projectName: project.projectName ?? "",
    projectDescription: project.projectDescription ?? "",
    status: project.status ?? "Active",
  };
}

export function updateProjectMaintenanceFromForm(
  project: ProjectMaintenance,
  values: ProjectMaintenanceFormValues,
): ProjectMaintenance {
  return {
    ...project,
    projectName: values.projectName.trim(),
    projectDescription: values.projectDescription.trim(),
    status: values.status,
  };
}

export function getProjectMaintenanceTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 8) return "min-w-[112rem]";
  if (visibleColumnCount === 7) return "min-w-[98rem]";
  if (visibleColumnCount === 6) return "min-w-[84rem]";
  if (visibleColumnCount === 5) return "min-w-[70rem]";
  return "min-w-[56rem]";
}
