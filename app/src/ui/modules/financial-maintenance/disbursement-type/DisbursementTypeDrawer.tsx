"use client";

import { useMemo, useState } from "react";
import {
  DisbursementTypeActionCopy,
  DisbursementTypeDrawerFormId,
  DisbursementTypeTitle,
} from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import { useDisbursementTypeFormPage } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementTypeFormPage";
import type { AccountLevel } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { DisbursementTypeDrawerProps } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import {
  DisbursementTypeExpenseSubAccountDialog,
  type DisbursementTypeExpenseSubAccountDialogState,
} from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeExpenseSubAccountDialog";
import { DisbursementTypeFields } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeFields";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { getAccountLevelLabel } from "@/app/src/utils/accounts.util";

const DefaultDisbursementTypeDrawerPermissions = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canCancel: true,
  canExport: false,
  canImport: false,
};

export function DisbursementTypeDrawer({
  disbursementType,
  isOpen,
  kind = "disbursement",
  mode,
  permissions = DefaultDisbursementTypeDrawerPermissions,
  onClose,
  onSaved,
}: DisbursementTypeDrawerProps) {
  return (
    <DisbursementTypeDrawerPanel
      key={`${mode}-${disbursementType?.id ?? "new"}`}
      disbursementType={disbursementType}
      isOpen={isOpen}
      kind={kind}
      mode={mode}
      permissions={permissions}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function DisbursementTypeDrawerPanel({
  disbursementType,
  isOpen,
  kind = "disbursement",
  mode,
  permissions = DefaultDisbursementTypeDrawerPermissions,
  onClose,
  onSaved,
}: DisbursementTypeDrawerProps) {
  const page = useDisbursementTypeFormPage({
    existingDisbursementType: disbursementType,
    isOpen,
    kind,
    mode,
    onSaved: (savedRecord) => {
      onSaved?.(savedRecord);
      onClose();
    },
  });
  const [expenseSubAccountDialog, setExpenseSubAccountDialog] = useState<DisbursementTypeExpenseSubAccountDialogState>(null);
  const copy = DisbursementTypeActionCopy[mode];
  const singularTitle = kind === "collection" ? "Collection Type" : "Disbursement Type";
  const moduleTitle = kind === "collection" ? "Collection Type Maintenance" : DisbursementTypeTitle;
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
    (permissions?.canCreate ?? true) &&
    page.values.type === "EXPENSE" &&
    page.values.accountSetupMode === "Auto" &&
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
        eyebrow={moduleTitle}
        formId={DisbursementTypeDrawerFormId}
        isOpen={isOpen}
        isReadonly={page.isReadonly}
        isSaving={page.isSubmitting}
        onBeforeSaveConfirm={page.validateBeforeSubmit}
        onCancel={handleCancel}
        onClose={handleClose}
        savingLabel={getModuleSavePendingLabel(mode)}
        submitLabel={mode === "edit" ? `Update ${singularTitle}` : `Save ${singularTitle}`}
        title={copy.title.replace("Disbursement Type", singularTitle)}
      >
        <form id={DisbursementTypeDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
          <DisbursementTypeFields
            accountOptions={page.accountOptions}
            canAddExpenseTypeSubAccount={canAddExpenseTypeSubAccount}
            canCancelStatus={permissions?.canCancel ?? true}
            errors={page.errors}
            expenseParentOptions={expenseParentOptions}
            generatedAccounts={disbursementType?.generatedAccounts}
            hideTypeField
            isLoadingExpenseParentOptions={page.isLoadingExpenseParentOptions}
            isReadonly={page.isReadonly}
            mode={mode}
            nameLabel={`${singularTitle} Name`}
            nextExpenseSubAccountLevel={nextExpenseSubAccountLevel}
            onAccountSetupModeChange={page.handleAccountSetupModeChange}
            onExpenseAccountChange={page.handleExpenseAccountChange}
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
      <DisbursementTypeExpenseSubAccountDialog
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
