import type { ClipboardEventHandler, KeyboardEventHandler } from "react";
import {
  TermsMaintenanceDatemodeOptions,
  TermsMaintenanceFieldClassName,
  TermsMaintenanceSelectClassName,
} from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import type { TermsMaintenanceFieldsProps } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";

export function TermsMaintenanceFields({ errors, isReadonly, values, onInputChange, onStatusChange }: TermsMaintenanceFieldsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField label="Term Name" error={errors.name} className="lg:col-span-2" required>
        <input
          name="name"
          value={values.name}
          onChange={onInputChange}
          readOnly={isReadonly}
          className={TermsMaintenanceFieldClassName}
          placeholder="Enter Term Name..."
        />
      </FormField>

      <FormField label="Description" error={errors.description} className="lg:col-span-2">
        <textarea
          name="description"
          maxLength={500}
          value={values.description}
          onChange={onInputChange}
          readOnly={isReadonly}
          placeholder={isReadonly ? "No Description..." : "Enter Description..."}
          className={`${TermsMaintenanceFieldClassName} min-h-24 resize-y py-3 ${isReadonly ? "placeholder:italic" : ""}`}
        />
      </FormField>

      <FormField label="Datemode" error={errors.datemode} required>
        <select
          name="datemode"
          value={values.datemode}
          onChange={onInputChange}
          disabled={isReadonly}
          className={TermsMaintenanceSelectClassName}
        >
          {TermsMaintenanceDatemodeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Period"
        error={errors.period}
        warning={values.period.trim() === "0" ? "Period is 0. Save only if this term should not add time." : undefined}
        required
      >
        <input
          name="period"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={values.period}
          onChange={onInputChange}
          onKeyDown={preventNonWholeNumberInput}
          onPaste={preventNonWholeNumberPaste}
          onWheel={(event) => event.currentTarget.blur()}
          readOnly={isReadonly}
          className={TermsMaintenanceFieldClassName}
          placeholder="Enter period"
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



const blockedPeriodKeys = new Set(["e", "E", "+", "-", "."]);

const preventNonWholeNumberInput: KeyboardEventHandler<HTMLInputElement> = (event) => {
  if (blockedPeriodKeys.has(event.key)) {
    event.preventDefault();
  }
};

const preventNonWholeNumberPaste: ClipboardEventHandler<HTMLInputElement> = (event) => {
  const pastedText = event.clipboardData.getData("text");

  if (!/^\d+$/.test(pastedText.trim())) {
    event.preventDefault();
  }
};
