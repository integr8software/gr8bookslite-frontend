import { ProjectMaintenanceTypeOptions } from "@/app/src/constants/modules/project-maintenance/ProjectMaintenanceConstants";
import type { ProjectMaintenanceFieldsProps } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
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
  onTypeChange,
}: ProjectMaintenanceFieldsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label="Project Code" error={errors.projectCode}>
        <input name="projectCode" value={values.projectCode} readOnly placeholder="Auto-generated" />
      </FormField>

      <FormField label="Project Name" error={errors.projectName} required>
        <input
          name="projectName"
          value={values.projectName}
          onChange={onInputChange}
          readOnly={isReadonly}
          placeholder="Enter Project Name..."
        />
      </FormField>

      <FormField label="Type" error={errors.type} required>
        <AppAdvancedDropdown
          value={values.type}
          readOnly={isReadonly}
          options={ProjectMaintenanceTypeOptions.map((type) => ({ name: type, value: type }))}
          placeholder="Select Type"
          onChange={(value) => onTypeChange(String(value) as typeof values.type)}
        />
      </FormField>

      <FormField label="Description" error={errors.description} className="lg:col-span-2">
        <AppLimitedTextarea
          name="description"
          maxLength={500}
          value={values.description}
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
