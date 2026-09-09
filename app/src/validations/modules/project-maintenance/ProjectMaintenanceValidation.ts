import { z } from "zod";
import { ProjectMaintenanceStatusOptions } from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import type {
  ProjectMaintenanceFormErrors,
  ProjectMaintenanceFormValues,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

const ProjectMaintenanceFormSchema = z.object({
  projectName: z.string().trim().min(1, "Enter a project name.").max(150, "Project name must be 150 characters or fewer."),
  projectDescription: z.string().trim().max(500, "Project description must be 500 characters or fewer."),
  status: z.enum(ProjectMaintenanceStatusOptions, {
    message: "Select a status.",
  }),
});

export function validateProjectMaintenanceForm(values: ProjectMaintenanceFormValues): ProjectMaintenanceFormErrors {
  const errors: ProjectMaintenanceFormErrors = {};
  const result = ProjectMaintenanceFormSchema.safeParse(values);

  if (result.success) {
    return errors;
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ProjectMaintenanceFormValues | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}
