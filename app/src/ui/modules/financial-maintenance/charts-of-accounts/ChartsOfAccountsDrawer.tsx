"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  currentAccountLevelOrDefault,
  getAvailableAccountLevels,
  getInitialFormValues,
  getStandardNormalBalance,
  getStandardStatementSection,
  isCashInBankParent,
} from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsFormHelpers";
import {
  AccountLevelLabels,
  SpecificAccountLevel,
} from "@/app/src/constants/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsConstants";
import { FetchNextChartAccountCode } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type {
  AccountType,
  AccountLevel,
  ChartAccount,
  ChartAccountFormValues,
  ChartsOfAccountsDrawerMode,
  ChartsOfAccountsDrawerProps,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  getDuplicateAccountNameError,
  isAccountInformationIncomplete,
  isBankDetailsIncomplete,
} from "@/app/src/validations/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsValidation";
import { ChartsOfAccountsForm } from "@/app/src/ui/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsForm";
import { Button } from "@/app/src/ui/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsControls";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { AnimatedPendingLabel, AppDialog } from "@/app/src/ui/shared/app/AppDialog";

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
  const [values, setValues] = useState<ChartAccountFormValues>(() => getInitialFormValues(account, parentAccount));
  const [submitted, setSubmitted] = useState(false);
  const [isAccountCodeLoading, setIsAccountCodeLoading] = useState(false);
  const [accountCodeError, setAccountCodeError] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaveConfirmPending, setIsSaveConfirmPending] = useState(false);
  const handledSaveResetToken = useRef(saveResetToken);
  const hasSeenSavingFromDialog = useRef(false);
  const availableAccountLevels = useMemo(() => getAvailableAccountLevels(accounts, values.parentId), [accounts, values.parentId]);
  const savePendingLabel = getModuleSavePendingLabel(mode);
  const accountNameError = getDuplicateAccountNameError(accounts, values, account);

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

    const shouldRefreshCode = !account || account.parentId !== values.parentId || account.accountLevel !== values.accountLevel;

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
        setAccountCodeError(error instanceof Error ? error.message : "Could not generate the next account code.");
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
    if (!isOpen) {
      hasSeenSavingFromDialog.current = false;
      queueMicrotask(() => {
        setIsSaveDialogOpen(false);
        setIsSaveConfirmPending(false);
      });
      return;
    }

    if (!isSaveDialogOpen) {
      hasSeenSavingFromDialog.current = false;
      queueMicrotask(() => setIsSaveConfirmPending(false));
      return;
    }

    if (isSaving) {
      hasSeenSavingFromDialog.current = true;
      queueMicrotask(() => setIsSaveConfirmPending(true));
      return;
    }

    if (hasSeenSavingFromDialog.current) {
      hasSeenSavingFromDialog.current = false;
      queueMicrotask(() => {
        setIsSaveDialogOpen(false);
        setIsSaveConfirmPending(false);
      });
    }
  }, [isOpen, isSaveDialogOpen, isSaving]);

  useEffect(() => {
    if (mode !== "add" || saveResetToken === 0 || saveResetToken === handledSaveResetToken.current) {
      return;
    }

    handledSaveResetToken.current = saveResetToken;
    setValues(getInitialFormValues(null, parentAccount));
    setSubmitted(false);
    setIsAccountCodeLoading(false);
    setAccountCodeError("");
  }, [mode, parentAccount, saveResetToken]);

  function updateField<Key extends keyof ChartAccountFormValues>(key: Key, value: ChartAccountFormValues[Key]) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "accountType"
        ? {
            normalBalance: getStandardNormalBalance(value as AccountType | ""),
            statementSection: getStandardStatementSection(value as AccountType | ""),
            parentId: null,
            accountNumber: "",
            isBankLinked: false,
          }
        : {}),
      ...(key === "accountLevel" ? { accountNumber: "" } : {}),
      ...(key === "accountLevel"
        ? {
            isBankLinked: value === SpecificAccountLevel && isCashInBankParent(accounts, current.parentId),
            isPostingAccount: value === SpecificAccountLevel,
          }
        : {}),
    }));
  }

  function updateParentAccount(parentId: string | null) {
    const nextLevels = getAvailableAccountLevels(accounts, parentId);
    const nextAccountLevel = currentAccountLevelOrDefault(values.accountLevel, nextLevels, !account);
    const isBankLinked = nextAccountLevel === SpecificAccountLevel && isCashInBankParent(accounts, parentId);

    setIsAccountCodeLoading(false);
    setAccountCodeError("");
    setValues((current) => ({
      ...current,
      accountLevel: nextAccountLevel,
      accountNumber: "",
      accountType: isBankLinked ? "ASSET" : current.accountType,
      isBankLinked,
      isPostingAccount: nextAccountLevel === SpecificAccountLevel,
      normalBalance: isBankLinked ? "DEBIT" : getStandardNormalBalance(current.accountType),
      statementSection: isBankLinked ? "Balance Sheet" : getStandardStatementSection(current.accountType),
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

  function validateBeforeSubmit() {
    setSubmitted(true);
    if (mode === "view") {
      return false;
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
      return false;
    }

    return true;
  }

  function handleSubmit() {
    if (!validateBeforeSubmit()) {
      return;
    }

    setIsSaveConfirmPending(true);
    onSave(values);
  }

  return (
    <>
      <ModuleDrawer
        isOpen={isOpen}
        eyebrow={getDrawerEyebrow(account, parentAccount)}
        title={getDrawerTitle(mode, account, parentAccount)}
        description={getDrawerDescription(parentAccount)}
        contentClassName="overflow-hidden"
        onClose={handleClose}
        spotlightId="module-drawer"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            {mode === "view" ? null : (
              <div data-spotlight-id="module-drawer-save">
                <Button
                  disabled={isSaving || isAccountCodeLoading}
                  onClick={() => {
                    if (validateBeforeSubmit()) {
                      setIsSaveDialogOpen(true);
                    }
                  }}
                >
                  {isSaving ? (
                    <AnimatedPendingLabel label={savePendingLabel} />
                  ) : isAccountCodeLoading ? (
                    "Generating Code"
                  ) : account ? (
                    "Save Changes"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div className="h-full min-h-0" data-spotlight-id="module-drawer-fields">
          <ChartsOfAccountsForm
            account={account}
            accounts={accounts}
            submitted={submitted}
            availableAccountLevels={availableAccountLevels}
            isAccountCodeLoading={isAccountCodeLoading}
            accountCodeError={accountCodeError}
            accountNameError={accountNameError}
            isReadOnly={mode === "view"}
            parentAccountError={submitted && !values.parentId ? "Required" : undefined}
            values={values}
            onFieldChange={updateField}
            onParentChange={updateParentAccount}
          />
        </div>
      </ModuleDrawer>
      <AppDialog
        confirmLabel="Confirm"
        description={
          account
            ? "This will update the selected chart account with your latest changes."
            : "This will create a new chart account using the details you entered."
        }
        iconTone="question"
        isOpen={isSaveDialogOpen}
        isPending={isSaving || isSaveConfirmPending}
        pendingLabel={savePendingLabel}
        title={account ? "Save chart account changes?" : "Create chart account?"}
        tone="success"
        onCancel={() => {
          if (!isSaving && !isSaveConfirmPending) {
            setIsSaveDialogOpen(false);
          }
        }}
        onConfirm={handleSubmit}
      />
    </>
  );
}

function getDrawerEyebrow(account: ChartAccount | null, parentAccount: ChartAccount | null) {
  if (account) {
    return "Edit ledger account";
  }

  if (parentAccount) {
    return `Add under ${parentAccount.accountName}`;
  }

  return "Create ledger account";
}

function getDrawerTitle(mode: ChartsOfAccountsDrawerMode, account: ChartAccount | null, parentAccount: ChartAccount | null) {
  if (mode === "view") {
    return "View Account";
  }

  if (account) {
    return account.accountName;
  }

  if (parentAccount) {
    return `Add ${AccountLevelLabels[getDefaultChildAccountLevel(parentAccount)]}`;
  }

  return `Add ${AccountLevelLabels[SpecificAccountLevel]}`;
}

function getDefaultChildAccountLevel(parentAccount: ChartAccount): AccountLevel {
  switch (parentAccount.accountLevel) {
    case "MAJOR":
      return "SUB1";
    case "SUB1":
    case "SUB2":
    case "SUB3":
    case SpecificAccountLevel:
      return SpecificAccountLevel;
  }

  return SpecificAccountLevel;
}

function getDrawerDescription(parentAccount: ChartAccount | null) {
  if (parentAccount) {
    return "Parent, type, statement section, nature, and account code are prefilled. Provide the account name to create the child account.";
  }

  return "Configure reporting, hierarchy, and bank setup.";
}
