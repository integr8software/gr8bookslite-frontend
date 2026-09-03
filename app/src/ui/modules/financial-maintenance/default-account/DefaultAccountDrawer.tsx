"use client";

import { useMemo, useState } from "react";
import {
  DefaultAccountActionCopy,
  DefaultAccountDrawerFormId,
  DefaultAccountTitle,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import { useDefaultAccountFormPage } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccountFormPage";
import type { AccountLevel } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { DefaultAccountDrawerProps } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import {
  DefaultAccountExpenseSubAccountDialog,
  type DefaultAccountExpenseSubAccountDialogState,
} from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountExpenseSubAccountDialog";
import { DefaultAccountFields } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountFields";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
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
  const [expenseSubAccountDialog, setExpenseSubAccountDialog] = useState<DefaultAccountExpenseSubAccountDialogState>(null);
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
        <form id={DefaultAccountDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
          <DefaultAccountFields
            canAddExpenseTypeSubAccount={canAddExpenseTypeSubAccount}
            canCancelStatus={permissions.canCancel}
            errors={page.errors}
            expenseParentOptions={expenseParentOptions}
            generatedAccounts={defaultAccount?.generatedAccounts}
            isLoadingExpenseParentOptions={page.isLoadingExpenseParentOptions}
            isReadonly={page.isReadonly}
            mode={mode}
            nextExpenseSubAccountLevel={nextExpenseSubAccountLevel}
            onExpenseParentChange={page.handleExpenseParentChange}
            onInputChange={page.handleInputChange}
            onOpenExpenseSubAccountDialog={() => {
              if (selectedExpenseParentAccount && nextExpenseSubAccountLevel) {
                setExpenseSubAccountDialog({
                  accountLevel: nextExpenseSubAccountLevel,
                  parentAccount: selectedExpenseParentAccount,
                });
              }
            }}
            onStatusChange={page.handleStatusChange}
            values={page.values}
          />
        </form>
      </ModuleDrawer>
      <DefaultAccountExpenseSubAccountDialog
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
