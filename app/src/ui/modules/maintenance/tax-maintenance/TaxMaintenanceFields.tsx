"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  TaxMaintenanceFieldClassName,
  TaxMaintenanceStatusOptions,
} from "@/app/src/constants/modules/maintenance/tax-maintenance/TaxMaintenanceConstants";
import type {
  TaxMaintenanceAccountField,
  TaxMaintenanceFieldsProps,
  TaxMaintenanceTab,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";

const accountFields: Array<{
  field: TaxMaintenanceAccountField;
  label: string;
}> = [
  { field: "inputVatAccountId", label: "Input VAT" },
  { field: "outputVatAccountId", label: "Output VAT" },
  { field: "deferredVatAccountId", label: "Deferred VAT" },
  {
    field: "expandedWithholdingTaxAccountId",
    label: "Expanded Withholding TAX",
  },
  {
    field: "creditableWithholdingTaxAccountId",
    label: "Creditable Withholding TAX",
  },
  {
    field: "withholdingVatableTaxAccountId",
    label: "Withholding Vatable TAX",
  },
  { field: "finalWithholdingTaxAccountId", label: "Final Withholding TAX" },
];

export function TaxMaintenanceFields({
  accountOptions,
  canAddTaxAccountTitle,
  errors,
  isReadonly,
  values,
  onAccountChange,
  onAddTaxAccountTitle,
  onInputChange,
}: TaxMaintenanceFieldsProps) {
  const [activeTab, setActiveTab] = useState<TaxMaintenanceTab>("tax");
  const errorTab = getErrorTab(errors);
  const visibleTab = errorTab ?? activeTab;

  return (
    <div className="grid gap-5">
      <div className="-mx-6 -mt-5 flex h-10 items-end gap-5 border-b border-darknavy/10 px-6">
        <TabButton
          isActive={visibleTab === "tax"}
          label="Tax Information"
          onClick={() => setActiveTab("tax")}
        />
        <TabButton
          isActive={visibleTab === "accounting"}
          label="Accounting Information"
          onClick={() => setActiveTab("accounting")}
        />
      </div>

      {visibleTab === "tax" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Tax Name"
            error={errors.name}
            required
            className="md:col-span-2"
          >
            <input
              name="name"
              value={values.name}
              onChange={onInputChange}
              readOnly={isReadonly}
              className={TaxMaintenanceFieldClassName}
            />
          </Field>
          <Field
            label="Description"
            error={errors.description}
            className="md:col-span-2"
          >
            <AppLimitedTextarea
              name="description"
              value={values.description}
              onChange={onInputChange}
              readOnly={isReadonly}
              rows={4}
              className={`${TaxMaintenanceFieldClassName} h-auto min-h-28 resize-y py-3`}
              counterMode="used"
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accountFields.map((accountField) => (
            <Field
              key={accountField.field}
              label={accountField.label}
              error={errors[accountField.field]}
              required
            >
              <ChartAccountDropdown
                addAction={
                  canAddTaxAccountTitle && onAddTaxAccountTitle
                    ? {
                        disabled: isReadonly,
                        label: "Add Tax Account Title",
                        onClick: () => onAddTaxAccountTitle(accountField.field),
                      }
                    : undefined
                }
                accounts={accountOptions}
                disabled={isReadonly}
                emptyMessage="No active Taxes Payables accounts found."
                placeholder="--Select Taxes Payables Account--"
                searchPlaceholder="Search account title or code"
                showSelectedDetails
                valueField="id"
                value={values[accountField.field]}
                onChange={(value) => onAccountChange(accountField.field, value)}
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
}

function getErrorTab(
  errors: TaxMaintenanceFieldsProps["errors"],
): TaxMaintenanceTab | null {
  if (accountFields.some((field) => errors[field.field])) {
    return "accounting";
  }

  if (errors.name || errors.description || errors.percentage || errors.status) {
    return "tax";
  }

  return null;
}

function TabButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 whitespace-nowrap border-b-2 text-sm font-semibold transition ${
        isActive
          ? "border-purple-500 text-purple-600"
          : "border-transparent text-darknavy/55 hover:text-darknavy"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  children,
  className,
  error,
  label,
  required,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
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

