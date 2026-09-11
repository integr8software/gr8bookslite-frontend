import type { ProjectMaintenanceLookupOption } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export function createProjectNameLookupOptions({
  currentProjectCode,
  currentProjectName,
  options: sourceOptions,
}: {
  currentProjectCode?: string;
  currentProjectName?: string;
  options: ProjectMaintenanceLookupOption[];
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = sourceOptions.map((project) => ({
    description: [project.type, project.description].filter(Boolean).join(" · "),
    label: project.projectCode,
    name: project.projectName,
    value: project.projectName,
  }));

  const projectName = currentProjectName?.trim() ?? "";
  const projectCode = currentProjectCode?.trim() ?? "";

  if (projectName && !options.some((option) => option.value.toLowerCase() === projectName.toLowerCase())) {
    options.unshift({
      label: projectCode,
      name: projectName,
      value: projectName,
    });
  }

  return options;
}

export function createProjectCodeLookupOptions({
  currentProjectCode,
  currentProjectName,
  options: sourceOptions,
}: {
  currentProjectCode?: string;
  currentProjectName?: string;
  options: ProjectMaintenanceLookupOption[];
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = sourceOptions.map((project) => ({
    description: [project.type, project.description].filter(Boolean).join(" · "),
    label: project.projectCode,
    name: project.projectName,
    value: project.projectCode || project.projectName,
  }));

  const projectCode = currentProjectCode?.trim() ?? "";
  const projectName = currentProjectName?.trim() ?? "";
  const currentValue = projectCode || projectName;

  if (currentValue && !options.some((option) => option.value.toLowerCase() === currentValue.toLowerCase())) {
    options.unshift({
      label: projectCode,
      name: projectName || currentValue,
      value: currentValue,
    });
  }

  return options;
}
