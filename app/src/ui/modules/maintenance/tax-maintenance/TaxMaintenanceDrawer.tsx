"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { EmptyBankDetails } from "@/app/src/data/modules/maintenance/charts-of-accounts/ChartsOfAccountsDefaults";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
  EmptyTaxFormValues,
  TaxMaintenanceActionCopy,
  TaxMaintenanceDrawerFormId,
  TaxMaintenanceTitle,
} from "@/app/src/constants/modules/maintenance/tax-maintenance/TaxMaintenanceConstants";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/charts-of-accounts/useChartsOfAccounts";
import {
  FetchNextChartAccountCode,
  SaveChartAccount,
} from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import type {
  ChartAccount,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type {
  TaxMaintenance,
  TaxMaintenanceAccountField,
  TaxMaintenanceDefaultAccountIds,
  TaxMaintenanceDrawerProps,
  TaxMaintenanceFormValues,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { TaxMaintenanceFields } from "@/app/src/ui/modules/maintenance/tax-maintenance/TaxMaintenanceFields";
import {
  type TaxMaintenanceFormErrors,
  validateTaxMaintenanceForm,
} from "@/app/src/validations/modules/maintenance/tax-maintenance/TaxMaintenanceValidation";

export function TaxMaintenanceDrawer({
  accountOptions,
  defaultAccountIds,
  isOpen,
  isSaving,
  mode,
  tax,
  onAccountOptionsChanged,
  onClose,
  onSave,
}: TaxMaintenanceDrawerProps) {
  const [values, setValues] = useState<TaxMaintenanceFormValues>(() =>
    tax ? toFormValues(tax) : createDefaultTaxFormValues(defaultAccountIds),
  );
  const [errors, setErrors] = useState<TaxMaintenanceFormErrors>({});
  const [taxAccountDialog, setTaxAccountDialog] =
    useState<TaxAccountTitleDialogState>(null);
  const [addedAccountOptions, setAddedAccountOptions] = useState<
    ModuleChartAccount[]
  >([]);
  const chartAccounts = useChartsOfAccounts();
  const copy = TaxMaintenanceActionCopy[mode];
  const isReadonly = mode === "view";
  const effectiveAccountOptions = useMemo(
    () => mergeAccountOptions(accountOptions, addedAccountOptions),
    [accountOptions, addedAccountOptions],
  );
  const accountById = useMemo(
    () => new Map(chartAccounts.flatAccounts.map(({ account }) => [account.id, account])),
    [chartAccounts.flatAccounts],
  );

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const field = event.target.name as keyof TaxMaintenanceFormValues;
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleAccountChange(
    field: TaxMaintenanceAccountField,
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleAddTaxAccountTitle(field: TaxMaintenanceAccountField) {
    const selectedAccountId = values[field] || accountOptions[0]?.id || "";
    const selectedAccount = accountById.get(selectedAccountId);
    const parentAccount = selectedAccount?.parentId
      ? accountById.get(selectedAccount.parentId)
      : null;

    if (!selectedAccount || !parentAccount) {
      toast.error("Select a tax account first.");
      return;
    }

    setTaxAccountDialog({
      field,
      parentAccount,
    });
  }

  function validateBeforeSubmit() {
    const nextErrors = validateTaxMaintenanceForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateBeforeSubmit()) {
      return;
    }

    await onSave(tax ? { ...tax, ...values } : values);
  }

  return (
    <ModuleDrawer
      description={copy.description}
      eyebrow={TaxMaintenanceTitle}
      formId={TaxMaintenanceDrawerFormId}
      isOpen={isOpen}
      isReadonly={isReadonly}
      isSaving={isSaving}
      onBeforeSaveConfirm={validateBeforeSubmit}
      onClose={onClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? "Update Tax" : "Save Tax"}
      title={copy.title}
    >
      <form
        id={TaxMaintenanceDrawerFormId}
        onSubmit={handleSubmit}
        className="px-6 py-5"
      >
        <TaxMaintenanceFields
          accountOptions={effectiveAccountOptions}
          canAddTaxAccountTitle={chartAccounts.permissions.canCreate}
          errors={errors}
          isReadonly={isReadonly}
          values={values}
          onAccountChange={handleAccountChange}
          onAddTaxAccountTitle={handleAddTaxAccountTitle}
          onInputChange={handleInputChange}
		  onStatusChange={(status) => {
			setValues((current) => ({ ...current, status }));
			setErrors((current) => ({ ...current, status: undefined }));
		  }}
        />
      </form>
      <TaxAccountTitleDialog
        isOpen={Boolean(taxAccountDialog)}
        parentAccount={taxAccountDialog?.parentAccount ?? null}
        onClose={() => setTaxAccountDialog(null)}
        onSaved={(account) => {
          if (taxAccountDialog) {
            setAddedAccountOptions((current) =>
              mergeAccountOptions(current, [toModuleChartAccount(account)]),
            );
            handleAccountChange(taxAccountDialog.field, account.id);
          }
          onAccountOptionsChanged?.();
          chartAccounts.refreshAccounts();
          setTaxAccountDialog(null);
        }}
      />
    </ModuleDrawer>
  );
}

type TaxAccountTitleDialogState = {
  field: TaxMaintenanceAccountField;
  parentAccount: ChartAccount;
} | null;

function TaxAccountTitleDialog({
  isOpen,
  parentAccount,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  parentAccount: ChartAccount | null;
  onClose: () => void;
  onSaved: (account: ChartAccount) => void;
}) {
  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isPending = isCodeLoading || isSaving;

  useEffect(() => {
    if (!isOpen || !parentAccount) {
      return;
    }

    let isCurrent = true;
    const timeoutId = window.setTimeout(() => {
      setAccountCode("");
      setAccountName("");
      setError("");
      setIsCodeLoading(true);

      FetchNextChartAccountCode({
        accountLevel: "SPECIFIC",
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
  }, [isOpen, parentAccount]);

  const handleSave = useCallback(async () => {
    const trimmedName = accountName.trim();

    if (!trimmedName) {
      setError("Tax Account Title is required.");
      return;
    }

    if (!parentAccount) {
      setError("Select a tax account first.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedAccount = await SaveChartAccount(
        createTaxAccountTitleValues({
          accountCode,
          accountName: trimmedName,
          parentAccount,
        }),
      );

      onSaved(savedAccount);
      toast.success("Tax account saved.");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Could not save the tax account."));
    } finally {
      setIsSaving(false);
    }
  }, [accountCode, accountName, onSaved, parentAccount]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
        return;
      }

      if (event.key === "Enter" && !isPending && accountCode) {
        event.preventDefault();
        void handleSave();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountCode, handleSave, isOpen, isPending, onClose]);

  if (!isOpen || !parentAccount) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tax-account-title-dialog-title"
        className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
      >
        <h2 id="tax-account-title-dialog-title" className="text-base font-semibold text-darknavy">
          Add Tax Account Title
        </h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-darknavy">
              Tax Account Title <span className="text-coralpink">*</span>
            </span>
            <input
              value={accountName}
              disabled={isPending}
              onChange={(event) => setAccountName(event.target.value)}
              className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
              placeholder="Input VAT - Local"
            />
          </label>
        </div>
        {error ? (
          <p className="mt-4 rounded-md border border-coralpink/20 bg-coralpink/5 px-3 py-2 text-sm font-semibold text-coralpink">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="inline-flex h-10 min-w-28 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending || !accountCode}
            onClick={() => void handleSave()}
            className="app-dialog-primary-button inline-flex h-10 min-w-32 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}

function createTaxAccountTitleValues({
  accountCode,
  accountName,
  parentAccount,
}: {
  accountCode: string;
  accountName: string;
  parentAccount: ChartAccount;
}): ChartAccountFormValues {
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
    showInReports: true,
    isPostingAccount: true,
    isBankLinked: false,
    bankDetails: EmptyBankDetails,
  };
}

function toModuleChartAccount(account: ChartAccount): ModuleChartAccount {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    accountType: account.accountType,
    statementGroup: account.statementGroup,
    statementSection: account.statementSection,
    normalBalance: account.normalBalance === "DEBIT" ? "Debit" : "Credit",
    accountCategory: account.accountGroup,
    description: account.description,
    status: account.status,
  };
}

function mergeAccountOptions(
  currentOptions: ModuleChartAccount[],
  addedOptions: ModuleChartAccount[],
): ModuleChartAccount[] {
  if (addedOptions.length === 0) {
    return currentOptions;
  }

  const optionById = new Map<string, ModuleChartAccount>();

  for (const option of currentOptions) {
    optionById.set(option.id, option);
  }

  for (const option of addedOptions) {
    optionById.set(option.id, option);
  }

  return [...optionById.values()];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function toFormValues(tax: TaxMaintenance): TaxMaintenanceFormValues {
  return {
    name: tax.name,
    description: tax.description,
    percentage: tax.percentage,
    inputVatAccountId: tax.inputVatAccountId,
    outputVatAccountId: tax.outputVatAccountId,
    deferredVatAccountId: tax.deferredVatAccountId,
    expandedWithholdingTaxAccountId: tax.expandedWithholdingTaxAccountId,
    creditableWithholdingTaxAccountId: tax.creditableWithholdingTaxAccountId,
    withholdingVatableTaxAccountId: tax.withholdingVatableTaxAccountId,
    finalWithholdingTaxAccountId: tax.finalWithholdingTaxAccountId,
    status: tax.status,
  };
}

function createDefaultTaxFormValues(
  defaultAccountIds: TaxMaintenanceDefaultAccountIds,
): TaxMaintenanceFormValues {
  return {
    ...EmptyTaxFormValues,
    ...defaultAccountIds,
  };
}



