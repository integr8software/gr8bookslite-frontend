"use client";

import { Suspense, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartsOfAccounts";
import { usePartyManagementAction } from "@/app/src/hooks/modules/party-management/usePartyManagementAction";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { PartyAccountingAccountField } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { PartyInformationActionHeader } from "@/app/src/ui/modules/party-management/PartyInformationActionHeader";
import { PartyInformationDetailsFields } from "@/app/src/ui/modules/party-management/PartyInformationDetailsFields";
import { PartyInformationNotFound } from "@/app/src/ui/modules/party-management/PartyInformationNotFound";
import { ChartAccountQuickAddDialog } from "@/app/src/ui/modules/financial-maintenance/charts-of-accounts/ChartAccountQuickAddDialog";
import { TermManagementQuickAddDialog } from "@/app/src/ui/modules/financial-maintenance/term-management/TermManagementQuickAddDialog";
import { PartyAccountingAccountFieldLabels } from "@/app/src/constants/modules/party-management/PartyManagementConstants";

const PartyManagementFormId = "party-management-form";

export function PartyManagementFormPage() {
  return (
    <Suspense fallback={null}>
      <PartyManagementFormPageInner />
    </Suspense>
  );
}

function PartyManagementFormPageInner() {
  const page = usePartyManagementAction();
  const chartAccounts = useChartsOfAccounts();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [accountTitleDialog, setAccountTitleDialog] =
    useState<ChartAccountQuickAddDialogState>(null);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false);
  const {
    closeDialog: closeSaveDialog,
    isConfirmSubmitPending,
    submitFromDialog,
  } = useAppDialogFormSubmit({
    formId: PartyManagementFormId,
    isDialogOpen: isSaveDialogOpen,
    isSubmitting: page.isMutating,
    onDialogOpenChange: setIsSaveDialogOpen,
  });
  const chartAccountById = useMemo(
    () => new Map(chartAccounts.flatAccounts.map(({ account }) => [account.id, account])),
    [chartAccounts.flatAccounts],
  );

  if (page.needsRecord && !page.existingRecord) {
    return <PartyInformationNotFound />;
  }

  const partyName = page.existingRecord ? getPartyDisplayName(page.existingRecord) : undefined;

  function openAccountTitleDialog(field: PartyAccountingAccountField) {
    const selectedAccountId = page.values[field] || page.accountOptions[field][0]?.id || "";
    const selectedAccount = chartAccountById.get(selectedAccountId);
    const parentAccount = selectedAccount?.parentId
      ? chartAccountById.get(selectedAccount.parentId)
      : null;

    if (!selectedAccount || !parentAccount) {
      toast.error("Select an account first.");
      return;
    }

    setAccountTitleDialog({ field, parentAccount });
  }

  return (
    <>
      <form
        id={PartyManagementFormId}
        onSubmit={page.handleSubmit}
        noValidate
        className="grid gap-5"
      >
        <PartyInformationActionHeader
          canSave={page.canSave}
          cancelHref={page.cancelHref}
          editHref={page.editHref}
          isReadonly={page.isReadonly}
          mode={page.mode}
          nextStatus={page.existingRecord ? page.nextStatus : undefined}
          onSave={() => {
            if (page.validateBeforeSubmit()) {
              setIsSaveDialogOpen(true);
            }
          }}
          onStatusChange={page.existingRecord ? () => page.setIsStatusDialogOpen(true) : undefined}
        />
        <PartyInformationDetailsFields
          accountOptions={page.accountOptions}
          atcOptions={page.atcOptions}
          errors={page.errors}
          isClassificationSelected={page.isClassificationSelected}
          isPartyCodeReadonly={page.isPartyCodeReadonly}
          isReadonly={page.isReadonly}
          partyTypeOptions={page.partyTypeOptions}
          termOptions={page.termOptions}
          values={page.values}
          syncedAddressSources={page.syncedAddressSources}
          canAddAccountTitle={chartAccounts.permissions.canCreate}
          canAddTerm={page.termPermissions.canCreate}
          onAddAccountTitle={openAccountTitleDialog}
          onAddTerm={() => setIsTermDialogOpen(true)}
          onAddressInputChange={page.handleAddressInputChange}
          onCopyAddress={page.copyAddress}
          onInputChange={page.handleInputChange}
          onPartyTypesChange={page.handlePartyTypesChange}
          onSelectBarangay={page.selectBarangay}
          onSelectAtcCode={page.selectAtcCode}
          onSelectAutocompleteAddress={page.selectAutocompleteAddress}
          onSyncAutocompleteAddressDetails={page.syncAutocompleteAddressDetails}
          onSelectCityMunicipality={page.selectCityMunicipality}
          onSelectProvince={page.selectProvince}
          onSelectTerm={page.selectTerm}
          onUpdateField={page.updateField}
        />
      </form>

      <AppDialog
        confirmLabel="Confirm"
        description={
          page.mode === "edit"
            ? "This will update the selected party with your latest changes."
            : "This will create a new party using the details you entered."
        }
        iconTone="question"
        isOpen={isSaveDialogOpen}
        isPending={isConfirmSubmitPending}
        pendingLabel={getModuleSavePendingLabel(page.mode)}
        title={page.mode === "edit" ? "Save party changes?" : "Save this party?"}
        tone="success"
        onCancel={closeSaveDialog}
        onConfirm={submitFromDialog}
      />

      <AppDialog
        isOpen={page.isStatusDialogOpen}
        isPending={page.isMutating}
        title={`Set party as ${page.nextStatus.toLowerCase()}?`}
        description={`This will mark ${partyName ?? "the selected party"} as ${page.nextStatus.toLowerCase()}.`}
        confirmLabel={page.nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"}
        tone={page.nextStatus === "Inactive" ? "deactivate" : "activate"}
        onCancel={() => page.setIsStatusDialogOpen(false)}
        onConfirm={page.handleConfirmStatusChange}
      />

      <ChartAccountQuickAddDialog
        accountLabel={
          accountTitleDialog
            ? PartyAccountingAccountFieldLabels[accountTitleDialog.field]
            : "Account"
        }
        isOpen={Boolean(accountTitleDialog)}
        parentAccount={accountTitleDialog?.parentAccount ?? null}
        onClose={() => setAccountTitleDialog(null)}
        onSaved={(accountId) => {
          if (accountTitleDialog) {
            page.updateField(accountTitleDialog.field, accountId);
          }
          chartAccounts.refreshAccounts();
          void page.accountOptionsRefetch();
          setAccountTitleDialog(null);
        }}
      />
      <TermManagementQuickAddDialog
        isOpen={isTermDialogOpen}
        onClose={() => setIsTermDialogOpen(false)}
        onSaved={(term) => {
          page.setSelectedTerm(term.id, term.name);
          void page.refreshTermOptions();
          setIsTermDialogOpen(false);
        }}
      />
    </>
  );
}

type ChartAccountQuickAddDialogState = {
  field: PartyAccountingAccountField;
  parentAccount: ChartAccount;
} | null;
