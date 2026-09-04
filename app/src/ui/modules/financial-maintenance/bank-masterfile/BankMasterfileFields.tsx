import {
  BankMasterfileAccountTypeOptions,
  BankMasterfileDefaultBankSwitchOption,
  BankMasterfileNotDefaultBankSwitchOption,
} from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import { buildBankMasterfileAccountName } from "@/app/src/data/modules/financial-maintenance/bank-masterfile/BankMasterfileData";
import type { BankMasterfileFieldsProps } from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";
import { FormField, ReadonlyField } from "@/app/src/ui/shared/field-management/ModuleFormField";

export function BankMasterfileFields({
  accountCode,
  currencyOptions,
  errors,
  isAccountCodeLoading,
  isReadonly,
  mode,
  values,
  onCurrencyChange,
  onDefaultChange,
  onInputChange,
  onStatusChange,
}: BankMasterfileFieldsProps) {
  const accountName = buildBankMasterfileAccountName(values);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField label="Bank Name" error={errors.bankName} required>
          <input
            id="bank-masterfile-bank-name"
            name="bankName"
            value={values.bankName}
            onChange={onInputChange}
            readOnly={isReadonly}
            placeholder="BDO"
          />
        </FormField>
        <FormField label="Branch" error={errors.branch}>
          <input
            id="bank-masterfile-branch"
            name="branch"
            value={values.branch}
            onChange={onInputChange}
            readOnly={isReadonly}
            placeholder="Makati Branch"
          />
        </FormField>
        <FormField
          label="Account Number"
          error={errors.accountNumber}
          helper={values.status === "Inactive" && !values.accountNumber.trim() ? "Add an account number to activate this bank." : undefined}
          required={values.status === "Active"}
        >
          <input
            id="bank-masterfile-account-number"
            name="accountNumber"
            value={values.accountNumber}
            onChange={onInputChange}
            readOnly={isReadonly}
            placeholder="Required before activation"
          />
        </FormField>
        <FormField label="Account Type" error={errors.accountType} required>
          <select
            id="bank-masterfile-account-type"
            name="accountType"
            value={values.accountType}
            onChange={onInputChange}
            disabled={isReadonly}
          >
            {BankMasterfileAccountTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>
        <ReadonlyField label="Account Code">
          {mode === "add" ? (isAccountCodeLoading ? "Loading..." : accountCode || "Auto series") : accountCode}
        </ReadonlyField>
        <ReadonlyField label="Account Title">
          {accountName}
        </ReadonlyField>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <FormField label="Series Start" error={errors.seriesStart} required>
          <input
            id="bank-masterfile-series-start"
            name="seriesStart"
            value={values.seriesStart}
            onChange={onInputChange}
            readOnly={isReadonly}
            placeholder="000001"
          />
        </FormField>
        <FormField label="Series End" error={errors.seriesEnd} required>
          <input
            id="bank-masterfile-series-end"
            name="seriesEnd"
            value={values.seriesEnd}
            onChange={onInputChange}
            readOnly={isReadonly}
            placeholder="999999"
          />
        </FormField>
        <FormField label="Series Digits" error={errors.seriesDigits} required>
          <input
            id="bank-masterfile-series-digits"
            name="seriesDigits"
            type="number"
            min="1"
            value={values.seriesDigits}
            onChange={onInputChange}
            readOnly={isReadonly}
            placeholder="6"
          />
        </FormField>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <FormField label="Currency" error={errors.currencyCode} required>
          <AppAdvancedDropdown
            readOnly={isReadonly}
            emptyMessage="No active currencies found."
            options={currencyOptions.map((currency) => ({
              description: `${currency.country} - ${currency.name}`,
              name: currency.code,
              selectedDetails: currency.name,
              value: currency.code,
            }))}
            placeholder="--Select Currency--"
            searchPlaceholder="Search currency"
            showSelectedDetails
            value={values.currencyCode}
            onChange={(value) => onCurrencyChange(Array.isArray(value) ? (value[0] ?? "") : value)}
          />
        </FormField>
        <FormField label="Default Bank">
          <AppSwitch
            falseOption={BankMasterfileNotDefaultBankSwitchOption}
            value={values.isDefault}
            onChange={onDefaultChange}
            readOnly={isReadonly}
            trueOption={BankMasterfileDefaultBankSwitchOption}
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
    </div>
  );
}
