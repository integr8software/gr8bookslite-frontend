import { z } from "zod";
import {
  ProjectMaintenanceStatusOptions,
  ProjectMaintenanceTypeOptions,
} from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import type {
  ProjectMaintenanceFormErrors,
  ProjectMaintenanceFormValues,
} from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";

const ProjectMaintenanceFormSchema = z.object({
  projectCode: z.string().trim().max(80, "Project code must be 80 characters or fewer."),
  projectName: z.string().trim().min(1, "Enter a project name.").max(150, "Project name must be 150 characters or fewer."),
  type: z.enum(ProjectMaintenanceTypeOptions, {
    message: "Select a type.",
  }),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer."),
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
