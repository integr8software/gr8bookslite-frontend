"use client";

import type { ReactNode } from "react";
import {
  TaxMaintenanceFieldClassName,
  TaxMaintenanceStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import type {
  TaxMaintenanceAccountField,
  TaxMaintenanceFieldsProps,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";

const accountFields: Array<{
  field: TaxMaintenanceAccountField;
  label: string;
}> = [
  { field: "inputVatAccountId", label: "Input VAT Account" },
  { field: "outputVatAccountId", label: "Output VAT Account" },
  { field: "vatPayableAccountId", label: "VAT Payable Account" },
  { field: "deferredInputTaxAccountId", label: "Deferred Input Tax Account" },
  { field: "deferredOutputVatAccountId", label: "Deferred Output VAT Account" },
];

export function TaxMaintenanceFields({
  accountOptions,
  errors,
  isReadonly,
  values,
  onAccountChange,
  onInputChange,
}: TaxMaintenanceFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={errors.name} required>
          <input
            name="name"
            value={values.name}
            onChange={onInputChange}
            readOnly={isReadonly}
            className={TaxMaintenanceFieldClassName}
          />
        </Field>
        <Field label="Percentage" error={errors.percentage} required>
          <input
            name="percentage"
            type="number"
            min="0"
            max="100"
            step="0.0001"
            value={values.percentage}
            onChange={onInputChange}
            readOnly={isReadonly}
            className={TaxMaintenanceFieldClassName}
          />
        </Field>
        <Field label="Status" error={errors.status} required>
          <select
            name="status"
            value={values.status}
            onChange={onInputChange}
            disabled={isReadonly}
            className={TaxMaintenanceFieldClassName}
          >
            {TaxMaintenanceStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {accountFields.map((accountField) => (
          <Field
            key={accountField.field}
            label={accountField.label}
            error={errors[accountField.field]}
          >
            <ChartAccountDropdown
              accounts={accountOptions}
              disabled={isReadonly}
              valueField="id"
              value={values[accountField.field]}
              onChange={(value) => onAccountChange(accountField.field, value)}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

function Field({
  children,
  error,
  label,
  required,
}: {
  children: ReactNode;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        {required ? <span className="text-coralpink"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-coralpink">
          {error}
        </span>
      ) : null}
    </div>
  );
}
