import { isValidElement, useId } from "react";
import { ServicesMaintenanceFieldClassName, ServicesMaintenanceServiceTypeOptions } from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";
import type {
  ServicesMaintenanceFieldsProps,
  ServicesMaintenanceFormFieldProps,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";

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
          placeholder="Enter name"
        />
      </FormField>
      <FormField label="Service Type" error={errors.serviceType} required className="lg:col-span-2">
        <select
          id="service-maintenance-service-type"
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

export function FormField({ children, className, error, helper, label, required }: ServicesMaintenanceFormFieldProps) {
  const generatedId = useId();
  const fieldId = isValidElement<{ id?: string }>(children) ? (children.props.id ?? generatedId) : generatedId;

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
      </label>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span>
      ) : helper ? (
        <span className="mt-1 block text-xs font-medium text-darknavy/55">{helper}</span>
      ) : null}
    </div>
  );
}
