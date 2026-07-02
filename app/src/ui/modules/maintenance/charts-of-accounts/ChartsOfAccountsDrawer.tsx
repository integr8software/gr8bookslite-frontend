"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartsOfAccountsDrawerTabs } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import {
  EmptyAccountFormValues,
  EmptyBankDetails,
  accountToFormValues,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import { FetchNextChartAccountCode } from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type {
  AccountLevel,
  BankDetailsKey,
  ChartAccount,
  ChartAccountFormValues,
  ChartsOfAccountsFormTab,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsForm } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsForm";
import {
  Button,
  Tabs,
} from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";

type ChartsOfAccountsDrawerProps = {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (values: ChartAccountFormValues) => void;
};

export function ChartsOfAccountsDrawer({
  account,
  accounts,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: ChartsOfAccountsDrawerProps) {
  return (
    <DrawerPanel
      key={account?.id ?? "new-account"}
      account={account}
      accounts={accounts}
      isOpen={isOpen}
      isSaving={isSaving}
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
  onClose,
  onSave,
}: ChartsOfAccountsDrawerProps) {
  const [activeTab, setActiveTab] = useState<ChartsOfAccountsFormTab>(
    "Account Information",
  );
  const [values, setValues] = useState<ChartAccountFormValues>(() =>
    getInitialFormValues(account),
  );
  const [submitted, setSubmitted] = useState(false);
  const [isAccountCodeLoading, setIsAccountCodeLoading] = useState(false);
  const [accountCodeError, setAccountCodeError] = useState("");

  const showBankDetails = values.accountCategory === "Cash in Bank";
  const tabs: ChartsOfAccountsFormTab[] = showBankDetails
    ? ChartsOfAccountsDrawerTabs
    : ["Account Information"];
  const availableAccountLevels = useMemo(
    () => getAvailableAccountLevels(accounts, values.parentId),
    [accounts, values.parentId],
  );

  useEffect(() => {
    if (!isOpen) {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- The drawer synchronizes its generated account-code request state with the selected parent/level.
    setIsAccountCodeLoading(true);
    setAccountCodeError("");

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
      ...(key === "accountLevel" ? { accountNumber: "" } : {}),
    }));
  }

  function updateParentAccount(parentId: string | null) {
    const nextLevels = getAvailableAccountLevels(accounts, parentId);

    setValues((current) => ({
      ...current,
      accountLevel: nextLevels.includes(current.accountLevel)
        ? current.accountLevel
        : nextLevels[0],
      accountNumber: "",
      parentId,
    }));
  }

  function updateBankField(key: BankDetailsKey, value: string) {
    setValues((current) => ({
      ...current,
      bankDetails: {
        ...(current.bankDetails ?? EmptyBankDetails),
        [key]: value,
      },
    }));
  }

  function resetDrawerForm() {
    setActiveTab("Account Information");
    setValues(getInitialFormValues(account));
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
    if (isAccountCodeLoading || !values.accountNumber || !values.accountName) {
      return;
    }
    onSave(values);
  }

  return (
    <ModuleDrawer
      isOpen={isOpen}
      eyebrow={account ? "Edit ledger account" : "Create ledger account"}
      title={account ? account.accountName : "Add Account"}
      description="Configure reporting, hierarchy, and bank setup."
      onClose={handleClose}
      spotlightId="maintenance-add-drawer"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <div data-spotlight-id="maintenance-add-drawer-save">
            <Button
              disabled={isSaving || isAccountCodeLoading}
              onClick={handleSubmit}
            >
              {isAccountCodeLoading
                ? "Generating Code"
                : account
                  ? "Save Changes"
                  : "Create Account"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="border-b border-darknavy/10 px-6 py-4">
        <Tabs value={activeTab} options={tabs} onChange={setActiveTab} />
      </div>

      <div data-spotlight-id="maintenance-add-drawer-fields">
        <ChartsOfAccountsForm
          account={account}
          accounts={accounts}
          activeTab={activeTab}
          submitted={submitted}
          availableAccountLevels={availableAccountLevels}
          isAccountCodeLoading={isAccountCodeLoading}
          accountCodeError={accountCodeError}
          values={values}
          onBankFieldChange={updateBankField}
          onFieldChange={updateField}
          onParentChange={updateParentAccount}
        />
      </div>
    </ModuleDrawer>
  );
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

function getInitialFormValues(
  account: ChartAccount | null,
): ChartAccountFormValues {
  const values = account
    ? accountToFormValues(account)
    : EmptyAccountFormValues;

  return {
    ...values,
    bankDetails: {
      ...(values.bankDetails ?? EmptyBankDetails),
    },
  };
}
