"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EmptyAccountFormValues,
  EmptyBankDetails,
  accountToFormValues,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import { FetchNextChartAccountCode } from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type {
  AccountLevel,
  AccountType,
  ChartAccount,
  ChartAccountFormValues,
  NormalBalance,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsForm } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsForm";
import { Button } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";

type ChartsOfAccountsDrawerProps = {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  isOpen: boolean;
  isSaving?: boolean;
  mode?: "add" | "edit" | "view";
  parentAccount?: ChartAccount | null;
  onClose: () => void;
  onSave: (values: ChartAccountFormValues) => void;
};

export function ChartsOfAccountsDrawer({
  account,
  accounts,
  isOpen,
  isSaving,
  mode = account ? "edit" : "add",
  parentAccount = null,
  onClose,
  onSave,
}: ChartsOfAccountsDrawerProps) {
  return (
    <DrawerPanel
      key={account?.id ?? parentAccount?.id ?? "new-account"}
      account={account}
      accounts={accounts}
      isOpen={isOpen}
      isSaving={isSaving}
      mode={mode}
      parentAccount={parentAccount}
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
  onClose,
  onSave,
}: ChartsOfAccountsDrawerProps) {
  const [values, setValues] = useState<ChartAccountFormValues>(() =>
    getInitialFormValues(account, parentAccount),
  );
  const [submitted, setSubmitted] = useState(false);
  const [isAccountCodeLoading, setIsAccountCodeLoading] = useState(false);
  const [accountCodeError, setAccountCodeError] = useState("");
  const availableAccountLevels = useMemo(
    () => getAvailableAccountLevels(accounts, values.parentId),
    [accounts, values.parentId],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!values.parentId || !values.accountLevel) {
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
  }, [account, isOpen, values.accountLevel, values.parentId]);

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
            parentId: null,
            accountNumber: "",
          }
        : {}),
      ...(key === "accountLevel" ? { accountNumber: "" } : {}),
    }));
  }

  function updateParentAccount(parentId: string | null) {
    const nextLevels = getAvailableAccountLevels(accounts, parentId);

    setIsAccountCodeLoading(false);
    setAccountCodeError("");
    setValues((current) => ({
      ...current,
      accountLevel:
        current.accountLevel && nextLevels.includes(current.accountLevel)
        ? current.accountLevel
        : nextLevels[0],
      accountNumber: "",
      parentId,
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
      !values.accountType ||
      !values.statementSection ||
      !values.parentId ||
      !values.accountNumber ||
      !values.accountName ||
      !values.accountLevel ||
      !values.normalBalance ||
      !values.status
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
      <div data-spotlight-id="maintenance-add-drawer-fields">
        <ChartsOfAccountsForm
          account={account}
          accounts={accounts}
          submitted={submitted}
          availableAccountLevels={availableAccountLevels}
          isAccountCodeLoading={isAccountCodeLoading}
          accountCodeError={accountCodeError}
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
  mode: "add" | "edit" | "view",
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
    return "Add Account Title";
  }

  return "Add Account";
}

function getDrawerDescription(parentAccount: ChartAccount | null) {
  if (parentAccount) {
    return "Parent, type, statement section, nature, and account code are prefilled. Provide the account name to create the child account.";
  }

  return "Configure reporting, hierarchy, and bank setup.";
}

function getAvailableAccountLevels(
  accounts: ChartAccount[],
  parentAccountId: string | null,
): AccountLevel[] {
  if (!parentAccountId) {
    return ["SPECIFIC"];
  }

  const parentAccount = accounts.find((item) => item.id === parentAccountId);

  switch (parentAccount?.accountLevel) {
    case "MAJOR":
      return ["SPECIFIC"];
    case "SUB1":
      return ["SPECIFIC"];
    case "SUB2":
      return ["SPECIFIC"];
    case "SUB3":
      return ["SPECIFIC"];
    default:
      return ["SPECIFIC"];
  }
}

function getStandardNormalBalance(accountType: AccountType | ""): NormalBalance | "" {
  if (!accountType) {
    return "";
  }

  return accountType === "ASSET" || accountType === "EXPENSE"
    ? "DEBIT"
    : "CREDIT";
}

function getInitialFormValues(
  account: ChartAccount | null,
  parentAccount: ChartAccount | null,
): ChartAccountFormValues {
  const values = account
    ? accountToFormValues(account)
    : EmptyAccountFormValues;

  return {
    ...values,
    ...(account || !parentAccount
      ? {}
      : {
          accountType: parentAccount.accountType,
          normalBalance: getStandardNormalBalance(parentAccount.accountType),
          parentId: parentAccount.id,
          statementGroup: parentAccount.statementGroup,
          statementSection: parentAccount.statementSection,
        }),
    bankDetails: {
      ...(values.bankDetails ?? EmptyBankDetails),
    },
  };
}
