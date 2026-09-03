import { ServicesMaintenanceFieldClassName, ServicesMaintenanceServiceTypeOptions } from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import type { ServicesMaintenanceFieldsProps } from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";

export { FormField };

export function ServicesMaintenanceFields({ errors, isReadonly, values, onInputChange }: ServicesMaintenanceFieldsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label="Service Name" error={errors.serviceName} required className="lg:col-span-2">
        <input
          id="services-maintenance-service-name"
          name="serviceName"
          value={values.serviceName}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={ServicesMaintenanceFieldClassName}
          placeholder="Enter service name"
        />
      </FormField>
      <FormField label="Type of Service" error={errors.serviceType} required className="lg:col-span-2">
        <select
          id="services-maintenance-service-type"
          name="serviceType"
          value={values.serviceType}
          onChange={onInputChange}
          disabled={isReadonly}
          className={ServicesMaintenanceFieldClassName}
        >
          {ServicesMaintenanceServiceTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Description" error={errors.description} className="lg:col-span-2">
        <textarea
          id="services-maintenance-description"
          name="description"
          maxLength={500}
          value={values.description}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={`${ServicesMaintenanceFieldClassName} min-h-28 resize-y py-3`}
          placeholder={isReadonly ? "No description" : "Enter description"}
        />
      </FormField>
    </div>
  );
}
