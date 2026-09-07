"use client";

import type { ResponsibilityCenterFieldsProps } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function ResponsibilityCenterFields({
  classifications,
  codePlaceholder,
  errors,
  isReadonly,
  nameLabel,
  onFieldChange,
  onInputChange,
  parentOptions,
  typeOptions,
  values,
}: ResponsibilityCenterFieldsProps) {
  const parentDropdownOptions: AppAdvancedDropdownOption[] = parentOptions.map((center) => ({
    description: center.financialType,
    name: center.name,
    value: center.id,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label="Classification" error={errors.classificationId} required>
        <select
          name="classificationId"
          value={values.classificationId}
          onChange={onInputChange}
          disabled={isReadonly}
        >
          <option value="">Select classification</option>
          {classifications.map((classification) => (
            <option key={classification.id} value={classification.id}>
              {classification.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Type" error={errors.typeId} required>
        <select
          name="typeId"
          value={values.typeId}
          onChange={onInputChange}
          disabled={isReadonly || !values.classificationId}
        >
          <option value="">Select type</option>
          {typeOptions.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={nameLabel} error={errors.name} required>
        <input
          name="name"
          value={values.name}
          onChange={onInputChange}
          readOnly={isReadonly || !values.classificationId}
          placeholder={values.classificationId ? "Sales Department" : "Select classification first"}
        />
      </FormField>

      <FormField label="Code" error={errors.code}>
        <input
          name="code"
          value={values.code}
          onChange={onInputChange}
          readOnly={isReadonly || !values.typeId}
          placeholder={codePlaceholder}
        />
      </FormField>

      <FormField label="Parent Responsibility Center" error={errors.parentId}>
        <AppAdvancedDropdown
          options={parentDropdownOptions}
          placeholder="No parent center"
          readOnly={isReadonly}
          searchPlaceholder="Search parent center"
          showSelectionIndicator={false}
          showSelectedDetails
          value={values.parentId}
          onChange={(value) => onFieldChange("parentId", String(value))}
        />
      </FormField>

      <FormField label="Manager" error={errors.manager}>
        <input
          name="manager"
          value={values.manager}
          onChange={onInputChange}
          readOnly={isReadonly}
          placeholder="Maria Santos"
        />
      </FormField>

      <FormField label="Description" error={errors.description} className="lg:col-span-2">
        <AppLimitedTextarea
          name="description"
          value={values.description}
          onChange={onInputChange}
          readOnly={isReadonly}
          showCounter={false}
        />
      </FormField>

      <FormField label="Status" required>
        <AppSwitch
          falseOption={MaintenanceInactiveStatusSwitchOption}
          value={values.status}
          onChange={(status) => onFieldChange("status", status)}
          readOnly={isReadonly}
          trueOption={MaintenanceActiveStatusSwitchOption}
        />
      </FormField>
    </div>
  );
}
