import {
  DiscountMaintenanceFieldClassName,
  DiscountMaintenanceSelectClassName,
  DiscountMaintenanceTypeOptions,
  DiscountMaintenanceValueTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import type { DiscountMaintenanceFieldsProps } from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";
import { FormField, ReadonlyField } from "@/app/src/ui/shared/field-management/ModuleFormField";

export function DiscountMaintenanceFields({
  errors,
  generatedAccount,
  isReadonly,
  values,
  onInputChange,
  onStatusChange,
}: DiscountMaintenanceFieldsProps) {
  return (
    <div className="grid gap-4">
      <FormField label="Name" error={errors.name} required>
        <input
          name="name"
          value={values.name}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={DiscountMaintenanceFieldClassName}
          placeholder="Enter discount name"
        />
      </FormField>

      <FormField label="Type" error={errors.type} required>
        <select
          name="type"
          value={values.type}
          onChange={onInputChange}
          disabled={isReadonly}
          className={DiscountMaintenanceSelectClassName}
        >
          {DiscountMaintenanceTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Description" error={errors.description}>
        <AppLimitedTextarea
          name="description"
          value={values.description}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={`${DiscountMaintenanceFieldClassName} min-h-24 py-3`}
          counterMode="used"
        />
      </FormField>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField label="Discount Type" error={errors.discountType} required>
          <select
            name="discountType"
            value={values.discountType}
            onChange={onInputChange}
            disabled={isReadonly}
            className={DiscountMaintenanceSelectClassName}
          >
            {DiscountMaintenanceValueTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Discount Value" error={errors.amount} required>
          <input
            name="amount"
            type="number"
            min="0"
            max={values.discountType === "Percentage" ? "100" : undefined}
            step="any"
            value={values.amount}
            onChange={onInputChange}
            readOnly={isReadonly}
            className={DiscountMaintenanceFieldClassName}
            placeholder={values.discountType === "Percentage" ? "Enter percentage" : "Enter fixed amount"}
          />
        </FormField>
      </div>

      {isReadonly ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ReadonlyField label="Account Code">{generatedAccount.accountCode}</ReadonlyField>
          <ReadonlyField label="Account Title">{generatedAccount.accountTitle}</ReadonlyField>
          <ReadonlyField label="Account Group" className="lg:col-span-2">
            {generatedAccount.accountGroupPath}
          </ReadonlyField>
        </div>
      ) : null}

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
