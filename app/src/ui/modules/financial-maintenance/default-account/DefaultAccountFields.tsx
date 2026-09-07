"use client";

import { DefaultAccountTypeOptions } from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import type { DefaultAccountFieldsProps } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function DefaultAccountFields({
  canAddExpenseTypeSubAccount,
  canCancelStatus = true,
  errors,
  expenseParentOptions = [],
  generatedAccounts,
  isLoadingExpenseParentOptions = false,
  isReadonly,
  mode,
  nextExpenseSubAccountLevel,
  onExpenseParentChange,
  onInputChange,
  onOpenExpenseSubAccountDialog,
  onStatusChange,
  values,
}: DefaultAccountFieldsProps) {
  return (
    <div className="grid gap-5">
      <FormField label="Default Account Name" error={errors.defaultAccountName} required>
        <input
          name="defaultAccountName"
          value={values.defaultAccountName}
          disabled={isReadonly}
          onChange={onInputChange}
          placeholder="Office Supplies"
          className="h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        />
      </FormField>

      <FormField label="Description" error={errors.description}>
        <AppLimitedTextarea
          name="description"
          value={values.description}
          disabled={isReadonly}
          readOnly={isReadonly}
          onChange={onInputChange}
          rows={3}
          showCounter={false}
          className="min-h-24 w-full resize-none rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        />
      </FormField>

      <FormField label="Type" error={errors.type} required>
        <select
          name="type"
          value={values.type}
          disabled={isReadonly || mode === "edit"}
          onChange={onInputChange}
          className="h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        >
          {DefaultAccountTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      {values.type === "EXPENSE" ? (
        <FormField label="Service Type" error={errors.expenseParentCoaId}>
          <AppAdvancedDropdown
            value={values.expenseParentCoaId}
            disabled={isReadonly || isLoadingExpenseParentOptions}
            addAction={
              onOpenExpenseSubAccountDialog
                ? {
                    disabled: !canAddExpenseTypeSubAccount,
                    label: nextExpenseSubAccountLevel ? "Add Sub Account" : "Add Service Type",
                    onClick: onOpenExpenseSubAccountDialog,
                  }
                : undefined
            }
            options={expenseParentOptions}
            placeholder={isLoadingExpenseParentOptions ? "Loading service accounts..." : "--Select Service Type--"}
            searchPlaceholder="Search service types"
            onChange={onExpenseParentChange ?? (() => {})}
          />
        </FormField>
      ) : null}

      <FormField label="Status" error={errors.status} required>
        <AppSwitch
          falseOption={MaintenanceInactiveStatusSwitchOption}
          value={values.status}
          readOnly={isReadonly || (mode === "edit" && !canCancelStatus)}
          onChange={onStatusChange}
          trueOption={MaintenanceActiveStatusSwitchOption}
        />
      </FormField>

      {generatedAccounts && generatedAccounts.length > 0 ? (
        <div className="grid gap-3 border-t border-darknavy/10 pt-5">
          <h3 className="text-sm font-semibold text-darknavy">Generated Chart of Accounts</h3>
          <div className="grid gap-2">
            {generatedAccounts.map((account) => (
              <div
                key={`${account.role}-${account.chartAccountId}`}
                className="rounded-md border border-darknavy/10 bg-darknavy/[0.02] p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">{account.role.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm font-semibold text-darknavy">
                  {account.accountCode} - {account.accountTitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
