"use client";

import {
  DisbursementTypeAccountSetupModeOptions,
  DisbursementTypeTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import type { DisbursementTypeFieldsProps } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { FormField, ReadonlyField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function DisbursementTypeFields({
  accountOptions = [],
  canAddExpenseTypeSubAccount,
  canCancelStatus = true,
  errors,
  expenseParentOptions = [],
  generatedAccounts,
  hideTypeField = false,
  isLoadingExpenseParentOptions = false,
  isReadonly,
  nameLabel = "Disbursement Type Name",
  mode,
  onAccountSetupModeChange,
  onExpenseAccountChange,
  onExpenseParentChange,
  onInputChange,
  onOpenExpenseSubAccountDialog,
  onStatusChange,
  values,
}: DisbursementTypeFieldsProps) {
  const isAuto = values.accountSetupMode === "Auto";
  const selectedAccount = accountOptions.find((account) => account.id === values.expenseCoaId);
  const generatedAccount = generatedAccounts?.find((account) => account.role === "EXPENSE");
  const displayedAccountCode = isAuto ? (generatedAccount?.accountCode ?? "Auto series") : (selectedAccount?.accountNumber ?? generatedAccount?.accountCode ?? "");
  const displayedAccountTitle = isAuto
    ? values.disbursementTypeName || "[Name]"
    : (selectedAccount?.accountName ?? generatedAccount?.accountTitle ?? "");

  return (
    <div className="grid gap-5">
      <FormField label={nameLabel} error={errors.disbursementTypeName} required>
        <input
          name="disbursementTypeName"
          value={values.disbursementTypeName}
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

      {hideTypeField ? null : (
        <FormField label="Type" error={errors.type} required>
          <select
            name="type"
            value={values.type}
            disabled={isReadonly || mode === "edit"}
            onChange={onInputChange}
            className="h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
          >
            {DisbursementTypeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {values.type === "EXPENSE" ? (
        <div className="grid gap-5">
          <div className="grid gap-2 sm:grid-cols-2">
            {DisbursementTypeAccountSetupModeOptions.map((option) => (
              <button
                key={option}
                type="button"
                disabled={isReadonly}
                onClick={() => onAccountSetupModeChange?.(option)}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                  values.accountSetupMode === option
                    ? "border-skyblue bg-skyblue/10 text-darknavy shadow-sm"
                    : "border-darknavy/10 bg-white text-darknavy/70 hover:border-skyblue/40"
                } disabled:cursor-not-allowed disabled:bg-darknavy/[0.03]`}
              >
                <span className="block font-semibold">
                  {option === "Existing" ? "Select Existing Account" : "Generate Account Automatically"}
                </span>
                <span className="mt-1 block text-xs text-darknavy/55">
                  {option === "Existing" ? "Use an existing expense posting account." : "Create an expense account for this disbursement type."}
                </span>
              </button>
            ))}
          </div>

          {isAuto ? (
            <FormField label="Sub Account" error={errors.expenseParentCoaId} required>
              <AppAdvancedDropdown
                value={values.expenseParentCoaId}
                disabled={isReadonly || isLoadingExpenseParentOptions}
                addAction={
                  onOpenExpenseSubAccountDialog
                    ? {
                        disabled: !canAddExpenseTypeSubAccount,
                        label: "Add Sub Account",
                        onClick: onOpenExpenseSubAccountDialog,
                      }
                    : undefined
                }
                options={expenseParentOptions}
                placeholder={isLoadingExpenseParentOptions ? "Loading sub accounts..." : "--Select Sub Account--"}
                searchPlaceholder="Search sub accounts"
                onChange={onExpenseParentChange ?? (() => {})}
              />
            </FormField>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <ReadonlyField label="Account Code">
              {displayedAccountCode}
            </ReadonlyField>
            {isAuto ? (
              <ReadonlyField label="Account Title">
                {displayedAccountTitle}
              </ReadonlyField>
            ) : (
              <FormField label="Account Title" error={errors.expenseCoaId} required>
                <ChartAccountDropdown
                  accounts={accountOptions}
                  disabled={isReadonly}
                  emptyMessage="No active expense accounts found."
                  placeholder="--Select Account Title--"
                  searchPlaceholder="Search account title or code"
                  value={values.expenseCoaId}
                  valueField="id"
                  onChange={onExpenseAccountChange ?? (() => {})}
                />
              </FormField>
            )}
          </div>
        </div>
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
