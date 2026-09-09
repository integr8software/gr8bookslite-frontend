import type { ProjectMaintenanceFieldsProps } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function ProjectMaintenanceFields({
  errors,
  isReadonly,
  values,
  onInputChange,
  onStatusChange,
}: ProjectMaintenanceFieldsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label="Project Name" error={errors.projectName} className="lg:col-span-2" required>
        <input
          name="projectName"
          value={values.projectName}
          onChange={onInputChange}
          readOnly={isReadonly}
          placeholder="Enter Project Name..."
        />
      </FormField>

      <FormField label="Project Description" error={errors.projectDescription} className="lg:col-span-2">
        <AppLimitedTextarea
          name="projectDescription"
          maxLength={500}
          value={values.projectDescription}
          onChange={onInputChange}
          readOnly={isReadonly}
          showCounter={false}
          className={isReadonly ? "placeholder:italic" : undefined}
        />
      </FormField>

      <FormField label="Status" error={errors.status} required>
        <AppSwitch
          falseOption={MaintenanceInactiveStatusSwitchOption}
          value={values.status}
          onChange={onStatusChange}
          readOnly={isReadonly}
          trueOption={MaintenanceActiveStatusSwitchOption}
        />
      </FormField>
    </div>
  );
}
