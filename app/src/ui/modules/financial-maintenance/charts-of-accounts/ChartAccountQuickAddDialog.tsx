"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EmptyBankDetails } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsDefaults";
import {
  FetchNextChartAccountCode,
  SaveChartAccount,
} from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type {
  ChartAccount,
  ChartAccountFormValues,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";
import { QuickAddDialog } from "@/app/src/ui/shared/module/QuickAddDialog";

type ChartAccountQuickAddDialogProps = {
  accountGroup?: string | string[];
  accountLabel?: string;
  isOpen: boolean;
  parentAccount: ChartAccount | null;
  onClose: () => void;
  onSaved: (accountId: string) => void;
};

export function ChartAccountQuickAddDialog({
  accountGroup,
  accountLabel = "Account",
  isOpen,
  parentAccount,
  onClose,
  onSaved,
}: ChartAccountQuickAddDialogProps) {
  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isPending = isCodeLoading || isSaving;

  useEffect(() => {
    if (!isOpen || !parentAccount) return;
    let isCurrent = true;
    const timeoutId = window.setTimeout(() => {
      setAccountCode("");
      setAccountName("");
      setError("");
      setIsCodeLoading(true);
      FetchNextChartAccountCode({ accountLevel: "SPECIFIC", parentAccountId: parentAccount.id })
        .then((nextCode) => {
          if (isCurrent) setAccountCode(nextCode);
        })
        .catch((error: unknown) => {
          if (isCurrent) setError(error instanceof Error ? error.message : "Could not generate code.");
        })
        .finally(() => {
          if (isCurrent) setIsCodeLoading(false);
        });
    });
    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, parentAccount]);

  const handleSave = useCallback(async () => {
    const trimmedName = accountName.trim();
    if (!trimmedName) {
      setError("Account title is required.");
      return;
    }
    if (!parentAccount) {
      setError("Select an account first.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const savedAccount = await SaveChartAccount(
        createAccountTitleValues({
          accountCode,
          accountGroup,
          accountName: trimmedName,
          parentAccount,
        }),
      );
      onSaved(savedAccount.id);
      toast.success("Account title saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save account title.");
    } finally {
      setIsSaving(false);
    }
  }, [accountCode, accountGroup, accountName, onSaved, parentAccount]);

  return (
    <QuickAddDialog
      error={error}
      isOpen={isOpen && Boolean(parentAccount)}
      isPending={isPending}
      saveDisabled={!accountCode}
      title={`Add ${accountLabel} Title`}
      onClose={onClose}
      onSave={handleSave}
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-darknavy">
          {accountLabel} Title
          <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired label={`${accountLabel} Title`} leadingSpace />
        </span>
        <input
          value={accountName}
          disabled={isPending}
          onChange={(event) => {
            setAccountName(event.target.value);
            setError("");
          }}
          className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        />
      </label>
    </QuickAddDialog>
  );
}

function createAccountTitleValues({
  accountCode,
  accountName,
  parentAccount,
  accountGroup,
}: {
  accountCode: string;
  accountName: string;
  parentAccount: ChartAccount;
  accountGroup?: string | string[];
}): ChartAccountFormValues & { accountGroup?: string | string[] } {
  return {
    accountNumber: accountCode,
    accountName,
    accountLevel: "SPECIFIC",
    accountType: parentAccount.accountType,
    parentId: parentAccount.id,
    normalBalance: parentAccount.normalBalance,
    statementGroup: parentAccount.statementGroup,
    statementSection: parentAccount.statementSection,
    reportAlias: "",
    description: "",
    status: "Active",
    accountGroup,
    showInReports: true,
    isPostingAccount: true,
    isBankLinked: false,
    bankDetails: EmptyBankDetails,
  };
}
