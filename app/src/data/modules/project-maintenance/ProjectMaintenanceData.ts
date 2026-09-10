import type { ProjectMaintenance, ProjectMaintenanceFormValues } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

export const ProjectMaintenanceInitialFormValues: ProjectMaintenanceFormValues = {
  projectCode: "",
  projectName: "",
  type: "Department",
  description: "",
  status: "Active",
};

export function createProjectMaintenanceFormValues(project: ProjectMaintenance): ProjectMaintenanceFormValues {
  return {
    projectCode: project.projectCode ?? "",
    projectName: project.projectName ?? "",
    type: project.type ?? "Department",
    description: project.description ?? "",
    status: project.status ?? "Active",
  };
}

export function updateProjectMaintenanceFromForm(project: ProjectMaintenance, values: ProjectMaintenanceFormValues): ProjectMaintenance {
  return {
    ...project,
    projectCode: values.projectCode.trim(),
    projectName: values.projectName.trim(),
    type: values.type,
    description: values.description.trim(),
    status: values.status,
  };
}

export function getProjectMaintenanceTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 9) return "min-w-[126rem]";
  if (visibleColumnCount >= 8) return "min-w-[112rem]";
  if (visibleColumnCount === 7) return "min-w-[98rem]";
  if (visibleColumnCount === 6) return "min-w-[84rem]";
  if (visibleColumnCount === 5) return "min-w-[70rem]";
  return "min-w-[56rem]";
}
