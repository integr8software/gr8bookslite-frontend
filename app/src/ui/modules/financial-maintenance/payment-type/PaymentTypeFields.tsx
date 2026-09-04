"use client";

import { PaymentTypeOptions } from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import type {
  PaymentTypeClassification,
  PaymentTypeFieldsProps,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function PaymentTypeFields({ errors, isReadonly, onInputChange, values }: PaymentTypeFieldsProps) {
  return (
    <div className="grid gap-5">
      <FormField label="Payment Type Name" error={errors.paymentType} required>
        <input
          value={values.paymentType}
          readOnly={isReadonly}
          onChange={(event) => onInputChange("paymentType", event.target.value)}
          placeholder="Enter payment type name"
        />
      </FormField>

      <FormField label="Category" error={errors.type} required>
        <select
          value={values.type}
          disabled={isReadonly}
          onChange={(event) => onInputChange("type", event.target.value as PaymentTypeClassification)}
        >
          <option value="">--Select Category--</option>
          {PaymentTypeOptions.map((typeOption) => (
            <option key={typeOption} value={typeOption}>
              {typeOption}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Description" error={errors.description}>
        <AppLimitedTextarea
          value={values.description}
          readOnly={isReadonly}
          onChange={(event) => onInputChange("description", event.target.value)}
          counterMode="used"
        />
      </FormField>

      <FormField label="Status" error={errors.status} required className="max-w-xs">
        <AppSwitch
          falseOption={MaintenanceInactiveStatusSwitchOption}
          value={values.status}
          readOnly={isReadonly}
          onChange={(status) => onInputChange("status", status)}
          trueOption={MaintenanceActiveStatusSwitchOption}
        />
      </FormField>
    </div>
  );
}
