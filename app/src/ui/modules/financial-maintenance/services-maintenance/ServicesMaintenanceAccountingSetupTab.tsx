import {
  ServicesMaintenanceAccountSetupModeOptions,
  ServicesMaintenanceReadOnlyFieldClassName,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { buildGeneratedServiceRevenueAccountTitle } from "@/app/src/data/modules/financial-maintenance/services-maintenance/ServicesMaintenanceData";
import type {
  ServicesMaintenanceAccountingSetupTabProps,
  ServicesMaintenanceAccountSetupMode,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { FormField } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceFields";

export function ServicesMaintenanceAccountingSetupTab({
  accountOptions,
  canAddExpenseTypeSubAccount,
  errors,
  expenseNextAccountCode,
  expenseParentOptions = [],
  isAccountCodeLoading,
  isExpenseNextAccountCodeLoading,
  isLoadingExpenseParentOptions,
  isReadonly,
  mode,
  nextAccountCode,
  nextExpenseSubAccountLevel,
  selectedService,
  values,
  onAccountSetupModeChange,
  onAddAccountTitle,
  onExpenseParentChange,
  onOpenExpenseSubAccountDialog,
  onRevenueAccountChange,
}: ServicesMaintenanceAccountingSetupTabProps) {
  const isAuto = values.accountSetupMode === "Auto";
  const isPurchase = values.serviceType === "Purchase of Service";
  const selectedAccount = accountOptions.find((account) => account.id === values.revenueCoaId);
  const displayedAccountTitle = isAuto
    ? buildGeneratedServiceRevenueAccountTitle(values.serviceName || "[Name]")
    : (selectedAccount?.accountName ?? selectedService?.revenueAccountTitle ?? "");
  const displayedAccountCode = isAuto
    ? mode === "add"
      ? isPurchase
        ? isExpenseNextAccountCodeLoading
          ? "Loading..."
          : expenseNextAccountCode || (values.expenseParentCoaId ? "Auto series" : "--")
        : isAccountCodeLoading
          ? "Loading..."
          : nextAccountCode?.accountCode || "Auto series"
      : (selectedService?.revenueAccountCode ?? "")
    : (selectedAccount?.accountNumber ?? selectedService?.revenueAccountCode ?? "");

  return (
    <div className="grid gap-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {ServicesMaintenanceAccountSetupModeOptions.map((option) => (
          <button
            key={option}
            type="button"
            disabled={isReadonly}
            onClick={() => onAccountSetupModeChange(option as ServicesMaintenanceAccountSetupMode)}
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
              {option === "Existing"
                ? isPurchase
                  ? "Use an existing posting account."
                  : "Use an existing Service Revenues posting account."
                : isPurchase
                  ? "Create an expense account for this service."
                  : "Create a Service Revenues account for this service."}
            </span>
          </button>
        ))}
      </div>

      {isPurchase && isAuto ? (
        <FormField label="Expense Type" error={errors.expenseParentCoaId} required>
          <AppAdvancedDropdown
            value={values.expenseParentCoaId ?? ""}
            disabled={isReadonly || isLoadingExpenseParentOptions}
            addAction={
              onOpenExpenseSubAccountDialog
                ? {
                    disabled: !canAddExpenseTypeSubAccount,
                    label: nextExpenseSubAccountLevel ? "Add Sub Account" : "Add Expense Type",
                    onClick: onOpenExpenseSubAccountDialog,
                  }
                : undefined
            }
            options={expenseParentOptions}
            placeholder={isLoadingExpenseParentOptions ? "Loading expense accounts..." : "--Select Expense Type--"}
            searchPlaceholder="Search expense types"
            onChange={onExpenseParentChange ?? (() => {})}
          />
        </FormField>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField label="Account Code">
          <input
            id="services-maintenance-account-code"
            value={displayedAccountCode}
            readOnly
            className={ServicesMaintenanceReadOnlyFieldClassName}
          />
        </FormField>
        <FormField label="Account Title" error={!isAuto ? errors.revenueCoaId : undefined} required>
          {isAuto ? (
            <input
              id="services-maintenance-account-title"
              value={displayedAccountTitle}
              readOnly
              className={ServicesMaintenanceReadOnlyFieldClassName}
            />
          ) : (
            <ChartAccountDropdown
              accounts={accountOptions}
              addAction={{
                label: "Add Account Title",
                onClick: onAddAccountTitle,
              }}
              disabled={isReadonly}
              emptyMessage="No active accounts found."
              placeholder="--Select Account Title--"
              searchPlaceholder="Search account title or code"
              value={values.revenueCoaId}
              valueField="id"
              onChange={onRevenueAccountChange}
            />
          )}
        </FormField>
      </div>
    </div>
  );
}
