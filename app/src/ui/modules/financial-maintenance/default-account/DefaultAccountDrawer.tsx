"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  DefaultAccountActionCopy,
  DefaultAccountDrawerFormId,
  DefaultAccountTitle,
  DefaultAccountTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import { EmptyBankDetails } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsDefaults";
import { useDefaultAccountFormPage } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccountFormPage";
import { FetchNextChartAccountCode } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { createDefaultAccountExpenseSubAccount } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountApi";
import type {
  AccountLevel,
  ChartAccountFormValues,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type {
  DefaultAccountDrawerProps,
  DefaultAccountExpenseParentOption,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { QuickAddDialog } from "@/app/src/ui/shared/module/QuickAddDialog";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";
import { getAccountLevelLabel } from "@/app/src/utils/accounts.util";

export function DefaultAccountDrawer({ defaultAccount, isOpen, mode, permissions, onClose }: DefaultAccountDrawerProps) {
  return (
    <DefaultAccountDrawerPanel
      key={`${mode}-${defaultAccount?.id ?? "new"}`}
      defaultAccount={defaultAccount}
      isOpen={isOpen}
      mode={mode}
      permissions={permissions}
      onClose={onClose}
    />
  );
}

function DefaultAccountDrawerPanel({ defaultAccount, isOpen, mode, permissions, onClose }: DefaultAccountDrawerProps) {
  const page = useDefaultAccountFormPage({
    existingDefaultAccount: defaultAccount,
    isOpen,
    mode,
    onSaved: onClose,
  });
  const [expenseSubAccountDialog, setExpenseSubAccountDialog] = useState<ExpenseSubAccountDialogState>(null);
  const copy = DefaultAccountActionCopy[mode];
  const expenseParentOptions: AppAdvancedDropdownOption[] = page.expenseParentOptions.map((account) => ({
    value: account.id,
    name: account.accountTitle,
    label: account.accountCode,
    description: getAccountLevelLabel(account.accountLevel),
  }));
  const selectedExpenseParentId = page.values.expenseParentCoaId || page.expenseParentOptions[0]?.id || "";
  const selectedExpenseParentAccount = useMemo(
    () => page.expenseParentOptions.find((account) => account.id === selectedExpenseParentId) ?? null,
    [page.expenseParentOptions, selectedExpenseParentId],
  );
  const nextExpenseSubAccountLevel = getExpenseSubAccountLevel(selectedExpenseParentAccount?.accountLevel);
  const canAddExpenseTypeSubAccount =
    !page.isReadonly &&
    permissions.canCreate &&
    page.values.type === "EXPENSE" &&
    Boolean(selectedExpenseParentAccount && nextExpenseSubAccountLevel);

  function handleClose() {
    page.saveDraft();
    onClose();
  }

  function handleCancel() {
    page.discardDraft();
    onClose();
  }

  return (
    <>
      <ModuleDrawer
        description={copy.description}
        eyebrow={DefaultAccountTitle}
        formId={DefaultAccountDrawerFormId}
        isOpen={isOpen}
        isReadonly={page.isReadonly}
        isSaving={page.isSubmitting}
        onBeforeSaveConfirm={page.validateBeforeSubmit}
        onCancel={handleCancel}
        onClose={handleClose}
        savingLabel={getModuleSavePendingLabel(mode)}
        submitLabel={mode === "edit" ? "Update Default Account" : "Save Default Account"}
        title={copy.title}
      >
        <form id={DefaultAccountDrawerFormId} onSubmit={page.handleSubmit} className="grid gap-5 px-6 py-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-darknavy">
              Default Account Name <span className="text-coralpink">*</span>
            </span>
            <input
              name="defaultAccountName"
              value={page.values.defaultAccountName}
              disabled={page.isReadonly}
              onChange={page.handleInputChange}
              placeholder="Office Supplies"
              className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
            />
            {page.errors.defaultAccountName ? (
              <span className="text-xs font-semibold text-coralpink">{page.errors.defaultAccountName}</span>
            ) : null}
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-darknavy">Description</span>
            <textarea
              name="description"
              value={page.values.description}
              disabled={page.isReadonly}
              onChange={page.handleInputChange}
              placeholder="Optional notes for this default account"
              rows={3}
              className="min-h-24 resize-none rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-darknavy">
              Type <span className="text-coralpink">*</span>
            </span>
            <select
              name="type"
              value={page.values.type}
              disabled={page.isReadonly || mode === "edit"}
              onChange={page.handleInputChange}
              className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
            >
              {DefaultAccountTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {page.values.type === "EXPENSE" ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-darknavy">Service Type</span>
              <AppAdvancedDropdown
                value={page.values.expenseParentCoaId}
                disabled={page.isReadonly || page.isLoadingExpenseParentOptions}
                addAction={{
                  disabled: !canAddExpenseTypeSubAccount,
                  label: nextExpenseSubAccountLevel ? "Add Sub Account" : "Add Service Type",
                  onClick: () => {
                    if (selectedExpenseParentAccount && nextExpenseSubAccountLevel) {
                      setExpenseSubAccountDialog({
                        accountLevel: nextExpenseSubAccountLevel,
                        parentAccount: selectedExpenseParentAccount,
                      });
                    }
                  },
                }}
                options={expenseParentOptions}
                placeholder={page.isLoadingExpenseParentOptions ? "Loading service accounts..." : "--Select Service Type--"}
                searchPlaceholder="Search service types"
                onChange={page.handleExpenseParentChange}
              />
            </label>
          ) : null}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-darknavy">Status</span>
            <AppSwitch
              falseOption={MaintenanceInactiveStatusSwitchOption}
              value={page.values.status}
              readOnly={page.isReadonly || (mode === "edit" && !permissions.canCancel)}
              onChange={page.handleStatusChange}
              trueOption={MaintenanceActiveStatusSwitchOption}
            />
          </label>
          {defaultAccount?.generatedAccounts.length ? (
            <div className="grid gap-3 border-t border-darknavy/10 pt-5">
              <h3 className="text-sm font-semibold text-darknavy">Generated Chart of Accounts</h3>
              <div className="grid gap-2">
                {defaultAccount.generatedAccounts.map((account) => (
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
        </form>
      </ModuleDrawer>
      <ExpenseSubAccountDialog
        accountLevel={expenseSubAccountDialog?.accountLevel ?? null}
        isOpen={Boolean(expenseSubAccountDialog)}
        parentAccount={expenseSubAccountDialog?.parentAccount ?? null}
        onClose={() => setExpenseSubAccountDialog(null)}
        onSaved={async (accountId) => {
          await page.refreshExpenseParentOptions();
          page.handleExpenseParentChange(accountId);
          setExpenseSubAccountDialog(null);
        }}
      />
    </>
  );
}

type ExpenseSubAccountDialogState = {
  accountLevel: AccountLevel;
  parentAccount: DefaultAccountExpenseParentOption;
} | null;

function ExpenseSubAccountDialog({
  accountLevel,
  isOpen,
  parentAccount,
  onClose,
  onSaved,
}: {
  accountLevel: AccountLevel | null;
  isOpen: boolean;
  parentAccount: DefaultAccountExpenseParentOption | null;
  onClose: () => void;
  onSaved: (accountId: string) => Promise<void>;
}) {
  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isPending = isCodeLoading || isSaving;

  useEffect(() => {
    if (!isOpen || !parentAccount || !accountLevel) {
      return;
    }

    let isCurrent = true;
    const timeoutId = window.setTimeout(() => {
      setAccountCode("");
      setAccountName("");
      setError("");
      setIsCodeLoading(true);

      FetchNextChartAccountCode({
        accountLevel,
        parentAccountId: parentAccount.id,
      })
        .then((nextCode) => {
          if (isCurrent) {
            setAccountCode(nextCode);
          }
        })
        .catch((caughtError: unknown) => {
          if (isCurrent) {
            setError(getErrorMessage(caughtError, "Could not generate the next code."));
          }
        })
        .finally(() => {
          if (isCurrent) {
            setIsCodeLoading(false);
          }
        });
    });

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [accountLevel, isOpen, parentAccount]);

  const handleSave = useCallback(async () => {
    const trimmedName = accountName.trim();

    if (!trimmedName) {
      setError("Service Type Name is required.");
      return;
    }

    if (!parentAccount || !accountLevel) {
      setError("Select a service parent before adding a sub account.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedAccount = await createDefaultAccountExpenseSubAccount(
        createExpenseSubAccountValues({
          accountCode,
          accountLevel,
          accountName: trimmedName,
          parentAccount,
        }),
      );

      await onSaved(savedAccount.id);
      toast.success("Service type saved.");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Could not save the service sub account."));
    } finally {
      setIsSaving(false);
    }
  }, [accountCode, accountLevel, accountName, onSaved, parentAccount]);

  if (!isOpen || !parentAccount || !accountLevel) {
    return null;
  }

  return (
    <QuickAddDialog
      error={error}
      isOpen={isOpen}
      isPending={isPending}
      saveDisabled={!accountCode}
      title="Add Service Type"
      onClose={onClose}
      onSave={handleSave}
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-darknavy">
          Service Type Name <span className="text-coralpink">*</span>
        </span>
        <input
          value={accountName}
          disabled={isPending}
          onChange={(event) => {
            setAccountName(event.target.value);
            setError("");
          }}
          placeholder="Meals and representation"
          className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        />
      </label>
    </QuickAddDialog>
  );
}

function createExpenseSubAccountValues({
  accountCode,
  accountLevel,
  accountName,
  parentAccount,
}: {
  accountCode: string;
  accountLevel: AccountLevel;
  accountName: string;
  parentAccount: DefaultAccountExpenseParentOption;
}): ChartAccountFormValues {
  return {
    accountNumber: accountCode,
    accountName,
    accountLevel,
    accountType: "EXPENSE",
    parentId: parentAccount.id,
    normalBalance: "DEBIT",
    statementGroup: "Income Statement",
    statementSection: "Income Statement",
    reportAlias: "",
    description: "",
    status: "Active",
    showInReports: true,
    isPostingAccount: false,
    isBankLinked: false,
    bankDetails: EmptyBankDetails,
  };
}

function getExpenseSubAccountLevel(parentLevel: string | undefined): AccountLevel | null {
  switch (parentLevel) {
    case "MAJOR":
      return "SUB1";
    case "SUB1":
      return "SUB2";
    case "SUB2":
      return "SUB3";
    default:
      return null;
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
