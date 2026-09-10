"use client";

import { PartyManagementFieldClassName } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import {
  getSingleSelectedValue,
  getTaxDefaultEmptyMessage,
  getTaxDefaultLoadState,
} from "@/app/src/data/modules/party-management/PartyInformationTabsData";
import type {
  PartyTaxDefaultFieldProps,
  PartyTaxDefaultGroupProps,
  PartyTaxInformationTabProps,
} from "@/app/src/types/modules/party-management/PartyInformationTabsTypes";
import { Field } from "@/app/src/ui/modules/party-management/forms/PartyInformationField";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function PartyTaxInformationTab({
  errors,
  isReadonly,
  taxDefaultOptionsError,
  taxDefaultOptionsLoading,
  taxDefaultOptions,
  values,
  onInputChange,
  onUpdateField,
  isDetailsDisabled,
  showWithholdingDefaults,
}: PartyTaxInformationTabProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Tax Identification Number (TIN)" error={errors.tin}>
          <input
            name="tin"
            inputMode="numeric"
            maxLength={15}
            value={values.tin}
            onChange={onInputChange}
            readOnly={isReadonly}
            disabled={isDetailsDisabled}
            className={PartyManagementFieldClassName}
            placeholder="000-000-000-000"
          />
        </Field>
      </div>
      {values.partyTypes.includes("Vendor") ? (
        <TaxDefaultGroup title="Purchase Tax Defaults">
          <TaxDefaultField
            disabled={isDetailsDisabled}
            error={errors.defaultPurchaseInputVatTaxSourceKey}
            field="defaultPurchaseInputVatTaxSourceKey"
            label="Input VAT"
            loadState={getTaxDefaultLoadState(
              taxDefaultOptionsLoading,
              taxDefaultOptionsError,
            )}
            options={
              taxDefaultOptions.defaultPurchaseInputVatTaxSourceKey ?? []
            }
            value={values.defaultPurchaseInputVatTaxSourceKey}
            onUpdateField={onUpdateField}
          />
          <TaxDefaultField
            disabled={isDetailsDisabled}
            error={errors.defaultPurchaseEwtTaxSourceKey}
            field="defaultPurchaseEwtTaxSourceKey"
            label="Expanded Withholding Tax"
            loadState={getTaxDefaultLoadState(
              taxDefaultOptionsLoading,
              taxDefaultOptionsError,
            )}
            options={taxDefaultOptions.defaultPurchaseEwtTaxSourceKey ?? []}
            value={values.defaultPurchaseEwtTaxSourceKey}
            onUpdateField={onUpdateField}
          />
          {showWithholdingDefaults ? (
            <>
              <TaxDefaultField
                disabled={isDetailsDisabled}
                error={errors.defaultPurchaseFwtTaxSourceKey}
                field="defaultPurchaseFwtTaxSourceKey"
                label="Final Withholding Tax"
                loadState={getTaxDefaultLoadState(
                  taxDefaultOptionsLoading,
                  taxDefaultOptionsError,
                )}
                options={taxDefaultOptions.defaultPurchaseFwtTaxSourceKey ?? []}
                value={values.defaultPurchaseFwtTaxSourceKey}
                onUpdateField={onUpdateField}
              />
              <TaxDefaultField
                disabled={isDetailsDisabled}
                error={errors.defaultPurchaseWvatTaxSourceKey}
                field="defaultPurchaseWvatTaxSourceKey"
                label="VAT Withholding"
                loadState={getTaxDefaultLoadState(
                  taxDefaultOptionsLoading,
                  taxDefaultOptionsError,
                )}
                options={
                  taxDefaultOptions.defaultPurchaseWvatTaxSourceKey ?? []
                }
                value={values.defaultPurchaseWvatTaxSourceKey}
                onUpdateField={onUpdateField}
              />
            </>
          ) : null}
        </TaxDefaultGroup>
      ) : null}
      {values.partyTypes.includes("Customer") ? (
        <TaxDefaultGroup title="Sales Tax Defaults">
          <TaxDefaultField
            disabled={isDetailsDisabled}
            error={errors.defaultSalesOutputVatTaxSourceKey}
            field="defaultSalesOutputVatTaxSourceKey"
            label="Output VAT"
            loadState={getTaxDefaultLoadState(
              taxDefaultOptionsLoading,
              taxDefaultOptionsError,
            )}
            options={taxDefaultOptions.defaultSalesOutputVatTaxSourceKey ?? []}
            value={values.defaultSalesOutputVatTaxSourceKey}
            onUpdateField={onUpdateField}
          />
          <TaxDefaultField
            disabled={isDetailsDisabled}
            error={errors.defaultSalesCwtTaxSourceKey}
            field="defaultSalesCwtTaxSourceKey"
            label="Creditable Withholding Tax"
            loadState={getTaxDefaultLoadState(
              taxDefaultOptionsLoading,
              taxDefaultOptionsError,
            )}
            options={taxDefaultOptions.defaultSalesCwtTaxSourceKey ?? []}
            value={values.defaultSalesCwtTaxSourceKey}
            onUpdateField={onUpdateField}
          />
          {showWithholdingDefaults ? (
            <TaxDefaultField
              disabled={isDetailsDisabled}
              error={errors.defaultSalesWvatTaxSourceKey}
              field="defaultSalesWvatTaxSourceKey"
              label="VAT Withholding"
              loadState={getTaxDefaultLoadState(
                taxDefaultOptionsLoading,
                taxDefaultOptionsError,
              )}
              options={taxDefaultOptions.defaultSalesWvatTaxSourceKey ?? []}
              value={values.defaultSalesWvatTaxSourceKey}
              onUpdateField={onUpdateField}
            />
          ) : null}
        </TaxDefaultGroup>
      ) : null}
    </div>
  );
}

function TaxDefaultField({
  disabled,
  error,
  field,
  label,
  loadState,
  options,
  value,
  onUpdateField,
}: PartyTaxDefaultFieldProps) {
  const showOptionViewToggle = ![
    "defaultPurchaseInputVatTaxSourceKey",
    "defaultSalesOutputVatTaxSourceKey",
  ].includes(field);

  return (
    <Field label={label} error={error}>
      <AppAdvancedDropdown
        disabled={disabled}
        emptyMessage={getTaxDefaultEmptyMessage(loadState)}
        optionViewToggle={showOptionViewToggle}
        options={options}
        placeholder={`--Select ${label}--`}
        searchPlaceholder="Search tax name, code, rate, or description"
        value={value}
        onChange={(nextValue) =>
          onUpdateField(field, getSingleSelectedValue(nextValue))
        }
      />
    </Field>
  );
}

function TaxDefaultGroup({ children, title }: PartyTaxDefaultGroupProps) {
  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-semibold text-darknavy">{title}</h3>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </div>
  );
}
