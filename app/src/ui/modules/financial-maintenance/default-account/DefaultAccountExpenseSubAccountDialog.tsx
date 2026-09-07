"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EmptyBankDetails } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsDefaults";
import { FetchNextChartAccountCode } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { createDefaultAccountExpenseSubAccount } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountApi";
import type {
  AccountLevel,
  ChartAccountFormValues,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { DefaultAccountExpenseParentOption } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { QuickAddDialog } from "@/app/src/ui/shared/module/QuickAddDialog";

export type DefaultAccountExpenseSubAccountDialogState = {
  accountLevel: AccountLevel;
  parentAccount: DefaultAccountExpenseParentOption;
} | null;

export function DefaultAccountExpenseSubAccountDialog({
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
            setError(getDefaultAccountSubAccountErrorMessage(caughtError, "Could not generate the next code."));
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
      const responseAccount = savedAccount as { id: string; accountCode?: string; accountTitle?: string };
      const savedCode = responseAccount.accountCode?.trim();
      const savedTitle = responseAccount.accountTitle?.trim() || trimmedName;
      toast.success(
        savedCode
          ? `Service type saved. Saved with Account Code - Account Title: ${savedCode} - ${savedTitle}.`
          : "Service type saved.",
      );
    } catch (caughtError) {
      setError(getDefaultAccountSubAccountErrorMessage(caughtError, "Could not save the service sub account."));
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
      <FormField className="grid gap-2" label="Service Type Name" required>
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
      </FormField>
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

function getDefaultAccountSubAccountErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
