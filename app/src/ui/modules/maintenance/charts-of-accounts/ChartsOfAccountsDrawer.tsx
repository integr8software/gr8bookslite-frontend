"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  currentAccountLevelOrDefault,
  getAvailableAccountLevels,
  getInitialFormValues,
  getStandardNormalBalance,
  getStandardStatementSection,
  isCashInBankParent,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsFormHelpers";
import { AccountLevelLabels } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import { FetchNextChartAccountCode } from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type {
  AccountType,
  ChartAccount,
  ChartAccountFormValues,
  ChartsOfAccountsDrawerMode,
  ChartsOfAccountsDrawerProps,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  getDuplicateAccountNameError,
  isAccountInformationIncomplete,
  isBankDetailsIncomplete,
} from "@/app/src/validations/modules/maintenance/charts-of-accounts/ChartsOfAccountsValidation";
import { ChartsOfAccountsForm } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsForm";
import { Button } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";

export function ChartsOfAccountsDrawer({
  account,
  accounts,
  isOpen,
  isSaving,
  mode = account ? "edit" : "add",
  parentAccount = null,
  saveResetToken = 0,
  onClose,
  onSave,
}: ChartsOfAccountsDrawerProps) {
  return (
    <DrawerPanel
      key={`${mode}-${account?.id ?? parentAccount?.id ?? "new-account"}`}
      account={account}
      accounts={accounts}
      isOpen={isOpen}
      isSaving={isSaving}
      mode={mode}
      parentAccount={parentAccount}
      saveResetToken={saveResetToken}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function DrawerPanel({
  account,
  accounts,
  isOpen,
  isSaving = false,
  mode = account ? "edit" : "add",
  parentAccount = null,
  saveResetToken = 0,
  onClose,
  onSave,
}: ChartsOfAccountsDrawerProps) {
  const [values, setValues] = useState<ChartAccountFormValues>(() =>
    getInitialFormValues(account, parentAccount),
  );
  const [submitted, setSubmitted] = useState(false);
  const [isAccountCodeLoading, setIsAccountCodeLoading] = useState(false);
  const [accountCodeError, setAccountCodeError] = useState("");
  const handledSaveResetToken = useRef(saveResetToken);
  const availableAccountLevels = useMemo(
    () => getAvailableAccountLevels(accounts, values.parentId),
    [accounts, values.parentId],
  );
  const accountNameError = getDuplicateAccountNameError(
    accounts,
    values,
    account,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!values.parentId || !values.accountLevel) {
      return;
    }

    if (!availableAccountLevels.includes(values.accountLevel)) {
      return;
    }

    const shouldRefreshCode =
      !account ||
      account.parentId !== values.parentId ||
      account.accountLevel !== values.accountLevel;

    if (!shouldRefreshCode) {
      return;
    }

    let isCurrent = true;
    queueMicrotask(() => {
      if (isCurrent) {
        setIsAccountCodeLoading(true);
        setAccountCodeError("");
      }
    });

    FetchNextChartAccountCode({
      accountLevel: values.accountLevel,
      parentAccountId: values.parentId,
    })
      .then((accountCode) => {
        if (!isCurrent) {
          return;
        }

        setValues((current) => ({
          ...current,
          accountNumber: accountCode,
        }));
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        setValues((current) => ({
          ...current,
          accountNumber: "",
        }));
        setAccountCodeError(
          error instanceof Error
            ? error.message
            : "Could not generate the next account code.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsAccountCodeLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [account, availableAccountLevels, isOpen, values.accountLevel, values.parentId]);

  useEffect(() => {
    if (
      mode !== "add" ||
      saveResetToken === 0 ||
      saveResetToken === handledSaveResetToken.current
    ) {
      return;
    }

    handledSaveResetToken.current = saveResetToken;
    setValues(getInitialFormValues(null, parentAccount));
    setSubmitted(false);
    setIsAccountCodeLoading(false);
    setAccountCodeError("");
  }, [mode, parentAccount, saveResetToken]);

  function updateField<Key extends keyof ChartAccountFormValues>(
    key: Key,
    value: ChartAccountFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "accountType"
        ? {
            normalBalance: getStandardNormalBalance(value as AccountType | ""),
            statementSection: getStandardStatementSection(
              value as AccountType | "",
            ),
            parentId: null,
            accountNumber: "",
            isBankLinked: false,
          }
        : {}),
      ...(key === "accountLevel" ? { accountNumber: "" } : {}),
      ...(key === "accountLevel"
        ? {
            isBankLinked:
              value === "SPECIFIC" && isCashInBankParent(accounts, current.parentId),
            isPostingAccount: value === "SPECIFIC",
          }
        : {}),
    }));
  }

  function updateParentAccount(parentId: string | null) {
    const nextLevels = getAvailableAccountLevels(accounts, parentId);
    const nextAccountLevel = currentAccountLevelOrDefault(
      values.accountLevel,
      nextLevels,
      !account,
    );
    const isBankLinked =
      nextAccountLevel === "SPECIFIC" && isCashInBankParent(accounts, parentId);

    setIsAccountCodeLoading(false);
    setAccountCodeError("");
    setValues((current) => ({
      ...current,
      accountLevel: nextAccountLevel,
      accountNumber: "",
      accountType: isBankLinked ? "ASSET" : current.accountType,
      isBankLinked,
      isPostingAccount: true,
      normalBalance: isBankLinked
        ? "DEBIT"
        : getStandardNormalBalance(current.accountType),
      statementSection: isBankLinked
        ? "Balance Sheet"
        : getStandardStatementSection(current.accountType),
      parentId,
      showInReports: true,
    }));
  }

  function resetDrawerForm() {
    setValues(getInitialFormValues(account, parentAccount));
    setSubmitted(false);
    setIsAccountCodeLoading(false);
    setAccountCodeError("");
  }

  function handleClose() {
    onClose();
  }

  function handleCancel() {
    resetDrawerForm();
    onClose();
  }

  function handleSubmit() {
    setSubmitted(true);
    if (mode === "view") {
      return;
    }

    if (
      isAccountCodeLoading ||
      isAccountInformationIncomplete({
        account,
        accounts,
        accountCodeError,
        accountNameError,
        availableAccountLevels,
        isAccountCodeLoading,
        isReadOnly: false,
        submitted,
        values,
        onFieldChange: updateField,
        onParentChange: updateParentAccount,
      }) ||
      (values.isBankLinked && isBankDetailsIncomplete(values))
    ) {
      return;
    }
    onSave(values);
  }

  return (
    <ModuleDrawer
      isOpen={isOpen}
      eyebrow={getDrawerEyebrow(account, parentAccount)}
      title={getDrawerTitle(mode, account, parentAccount)}
      description={getDrawerDescription(parentAccount)}
      contentClassName="overflow-hidden"
      onClose={handleClose}
      spotlightId="maintenance-add-drawer"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          {mode === "view" ? null : (
            <div data-spotlight-id="maintenance-add-drawer-save">
              <Button
                disabled={isSaving || isAccountCodeLoading}
                onClick={handleSubmit}
              >
                {isSaving
                  ? account
                    ? "Saving Changes..."
                    : "Creating Account..."
                  : isAccountCodeLoading
                  ? "Generating Code"
                  : account
                    ? "Save Changes"
                    : "Create Account"}
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div
        className="h-full min-h-0"
        data-spotlight-id="maintenance-add-drawer-fields"
      >
        <ChartsOfAccountsForm
          account={account}
          accounts={accounts}
          submitted={submitted}
          availableAccountLevels={availableAccountLevels}
          isAccountCodeLoading={isAccountCodeLoading}
          accountCodeError={accountCodeError}
          accountNameError={accountNameError}
          isReadOnly={mode === "view"}
          parentAccountError={
            submitted && !values.parentId ? "Required" : undefined
          }
          values={values}
          onFieldChange={updateField}
          onParentChange={updateParentAccount}
        />
      </div>
    </ModuleDrawer>
  );
}

function getDrawerEyebrow(
  account: ChartAccount | null,
  parentAccount: ChartAccount | null,
) {
  if (account) {
    return "Edit ledger account";
  }

  if (parentAccount) {
    return `Add under ${parentAccount.accountName}`;
  }

  return "Create ledger account";
}

function getDrawerTitle(
  mode: ChartsOfAccountsDrawerMode,
  account: ChartAccount | null,
  parentAccount: ChartAccount | null,
) {
  if (mode === "view") {
    return "View Account";
  }

  if (account) {
    return account.accountName;
  }

  if (parentAccount) {
    return `Add ${AccountLevelLabels.SPECIFIC}`;
  }

  return `Add ${AccountLevelLabels.SPECIFIC}`;
}

function getDrawerDescription(parentAccount: ChartAccount | null) {
  if (parentAccount) {
    return "Parent, type, statement section, nature, and account code are prefilled. Provide the account name to create the child account.";
  }

  return "Configure reporting, hierarchy, and bank setup.";
}
