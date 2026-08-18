"use client";

import { Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import {
  DisbursementVoucherActionTabs,
  DisbursementVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  DisbursementVoucherCopyFromRecords,
  DisbursementVoucherCopySources,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { createProjectResponsibilityCenterInitialValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { useDisbursementVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucherActionPage";
import type { DisbursementVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { BankMasterfileDrawer } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileDrawer";
import { DefaultAccountDrawer } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountDrawer";
import { PaymentTypeDrawer } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { DisbursementVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherActionHeader";
import { DisbursementVoucherBankInformationFields } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherBankInformationFields";
import { getPaymentTypeDetailKind } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherPaymentFields";
import { DisbursementVoucherEntrySection } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherEntrySection";
import { DisbursementVoucherDetailsFields } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherDetailsFields";
import { DisbursementVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherFileAttachmentFields";
import { DisbursementVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherNotFound";
import { openDisbursementVoucherPdf } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/reports/DisbursementVoucherPdf";
import { DisbursementVoucherReportPreview } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/reports/DisbursementVoucherReportPreview";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppSkeleton, AppSkeletonCard } from "@/app/src/ui/shared/app/AppSkeleton";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function DisbursementVoucherActionPage() {
  return (
    <Suspense fallback={<DisbursementVoucherActionSkeleton />}>
      <DisbursementVoucherActionInner />
    </Suspense>
  );
}

function DisbursementVoucherActionInner() {
  const voucherAction = useDisbursementVoucherActionPage();

  if (voucherAction.isRecordMissing) {
    return <DisbursementVoucherNotFound />;
  }

  return (
    <>
      <DisbursementVoucherActionShell voucherAction={voucherAction}>
        <DisbursementVoucherActionContent voucherAction={voucherAction} />
      </DisbursementVoucherActionShell>
      <DisbursementVoucherActionDialogs voucherAction={voucherAction} />
    </>
  );
}

function DisbursementVoucherActionShell({
  children,
  voucherAction,
}: {
  children: ReactNode;
  voucherAction: DisbursementVoucherActionPageState;
}) {
  if (voucherAction.isReadonly) {
    return <section className="grid min-w-0 gap-5">{children}</section>;
  }

  return (
    <form className="grid min-w-0 gap-5" onSubmit={voucherAction.handleSubmit}>
      {children}
    </form>
  );
}

function DisbursementVoucherActionContent({ voucherAction }: { voucherAction: DisbursementVoucherActionPageState }) {
  const paymentTypeDetailKind = getPaymentTypeDetailKind(voucherAction.values.paymentMethod, voucherAction.selectedPaymentTypeRecord);
  const actionTabs = DisbursementVoucherActionTabs.filter(
    (tab) => tab.id !== "bank-information" || (paymentTypeDetailKind !== "" && paymentTypeDetailKind !== "cash"),
  );

  return (
    <>
      <DisbursementVoucherActionHeader
        copyFromRecords={DisbursementVoucherCopyFromRecords}
        copyFromSources={DisbursementVoucherCopySources}
        mode={voucherAction.isReadonly ? "view" : voucherAction.mode}
        returnHref={voucherAction.returnHref}
        transaction={voucherAction.selectedTransaction}
        voucher={voucherAction.existingVoucher}
        onCopyFrom={voucherAction.handleCopyFrom}
        onPreview={() => voucherAction.setIsReportPreviewOpen(true)}
        onSaveDraft={() => voucherAction.requestDisbursementVoucherSubmit(DisbursementVoucherStatuses.draft)}
        onSubmit={() => voucherAction.requestDisbursementVoucherSubmit(DisbursementVoucherStatuses.forApproval)}
        onUpdateStatus={voucherAction.handleUpdateStatus}
      />
      <ModuleTabs
        activeTab={voucherAction.activeTab}
        ariaLabel="Disbursement voucher sections"
        tabs={actionTabs}
        onTabChange={voucherAction.setActiveTab}
      />
      {voucherAction.activeTab === "details" ? (
        <DisbursementVoucherDetailsSection voucherAction={voucherAction} />
      ) : voucherAction.activeTab === "bank-information" ? (
        <DisbursementVoucherBankInformationFields
          bankAccounts={voucherAction.bankAccounts}
          canAddBankAccount={voucherAction.bankMasterfileStore.permissions.canCreate}
          isMultiCheckNumber={Boolean(voucherAction.values.paymentDetails.isMultiCheckNumber)}
          isReadonly={voucherAction.isReadonly}
          paymentType={voucherAction.values.paymentMethod}
          paymentTypeRecord={voucherAction.selectedPaymentTypeRecord}
          paymentTypeRecords={voucherAction.paymentTypeStore.paymentTypes}
          values={voucherAction.values}
          onOpenBankAccountDrawer={() => voucherAction.setIsBankMasterfileDrawerOpen(true)}
          onUpdateBankAccount={voucherAction.handleBankAccountChange}
          onUpdatePaymentDetails={voucherAction.updatePaymentDetails}
        />
      ) : (
        <DisbursementVoucherFileAttachmentFields
          attachments={voucherAction.values.attachments}
          isReadonly={voucherAction.isReadonly}
          onAttachmentsChange={(attachments) => voucherAction.updateField("attachments", attachments)}
        />
      )}
    </>
  );
}

function DisbursementVoucherDetailsSection({ voucherAction }: { voucherAction: DisbursementVoucherActionPageState }) {
  const values = voucherAction.values;

  return (
    <>
      <DisbursementVoucherDetailsFields
        canAddPartyName={voucherAction.partyStore.permissions.canCreate}
        canAddPaymentType={voucherAction.paymentTypeStore.permissions.canCreate}
        canAddProjectName
        currencyOptions={voucherAction.currencyOptions}
        errors={voucherAction.errors}
        isExchangeRateLoading={voucherAction.isExchangeRateLoading}
        isReadonly={voucherAction.isReadonly}
        paymentTypeRecords={voucherAction.paymentTypeStore.paymentTypes}
        values={values}
        onOpenPartyNameDrawer={() => voucherAction.setIsPartyNameDrawerOpen(true)}
        onOpenPaymentTypeDrawer={() => voucherAction.setIsPaymentTypeDrawerOpen(true)}
        onOpenProjectNameDrawer={() => voucherAction.setIsProjectNameDrawerOpen(true)}
        onCurrencyChange={voucherAction.handleCurrencyChange}
        onPartyChange={voucherAction.handlePartyChange}
        onPaymentTypeChange={voucherAction.handlePaymentTypeChange}
        onUpdateField={voucherAction.updateField}
      />
      <DisbursementVoucherEntrySection
        bankAccount={voucherAction.selectedBankAccount}
        canAddExpenseType={voucherAction.defaultAccountStore.permissions.canCreate}
        canAddPartyName={voucherAction.partyStore.permissions.canCreate}
        canAddResponsibilityCenter={voucherAction.responsibilityCenterStore.permissions.canCreate}
        defaultAccounts={voucherAction.defaultAccounts}
        entries={values.lineEntries}
        errors={voucherAction.errors}
        isMultiCheckNumber={Boolean(values.paymentDetails.isMultiCheckNumber)}
        isReadonly={voucherAction.isReadonly}
        partyCode={values.partyCode}
        partyName={values.partyName}
        paymentMethod={values.paymentMethod}
        paymentTypeRecord={voucherAction.selectedPaymentTypeRecord}
        totalCredit={voucherAction.totalCredit}
        totalDebit={voucherAction.totalDebit}
        onAddEntries={voucherAction.handleAddEntries}
        onAddExpenseType={() => voucherAction.setIsDefaultAccountDrawerOpen(true)}
        onAddPartyName={() => voucherAction.setIsPartyNameDrawerOpen(true)}
        onAddResponsibilityCenter={voucherAction.handleOpenResponsibilityCenterDrawer}
        onClearEntries={voucherAction.handleClearEntries}
        onDuplicateEntry={voucherAction.handleDuplicateEntry}
        onInsertEntry={voucherAction.handleInsertEntry}
        onMoveEntry={voucherAction.handleMoveEntry}
        onRemoveEntry={voucherAction.handleRemoveEntry}
        onReplaceEntries={voucherAction.handleReplaceLineEntries}
        onUpdateEntry={voucherAction.handleUpdateEntry}
        onUpdateEntryFields={voucherAction.handleUpdateEntryFields}
      />
    </>
  );
}

function DisbursementVoucherActionDialogs({ voucherAction }: { voucherAction: DisbursementVoucherActionPageState }) {
  const isDraftSave = voucherAction.pendingSubmitStatus === DisbursementVoucherStatuses.draft;
  const actionLabel = voucherAction.mode === "edit" ? "Update" : isDraftSave ? "Save As Draft" : "Save";
  const projectInitialValues = useMemo(
    () =>
      createProjectResponsibilityCenterInitialValues(
        voucherAction.responsibilityCenterStore.classifications,
        voucherAction.responsibilityCenterStore.types,
      ),
    [voucherAction.responsibilityCenterStore.classifications, voucherAction.responsibilityCenterStore.types],
  );

  return (
    <>
      <AppDialog
        isOpen={voucherAction.pendingSubmitStatus !== null}
        title={`${actionLabel} Disbursement Voucher?`}
        description={`Confirm that you want to ${actionLabel.toLowerCase()} this Disbursement Voucher.`}
        confirmLabel={actionLabel}
        cancelLabel="Continue Editing"
        pendingLabel={voucherAction.mode === "edit" ? "Updating..." : "Saving..."}
        tone="question"
        onCancel={voucherAction.cancelDisbursementVoucherSubmit}
        onConfirm={voucherAction.confirmDisbursementVoucherSubmit}
      />
      <DisbursementVoucherReportPreview
        isOpen={voucherAction.isReportPreviewOpen}
        values={voucherAction.values}
        onClose={() => voucherAction.setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openDisbursementVoucherPdf(voucherAction.values)}
      />
      <PaymentTypeDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isPaymentTypeDrawerOpen}
        mode="add"
        onClose={() => voucherAction.setIsPaymentTypeDrawerOpen(false)}
      />
      <BankMasterfileDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isBankMasterfileDrawerOpen}
        mode="add"
        onClose={() => voucherAction.setIsBankMasterfileDrawerOpen(false)}
      />
      <PartyManagementDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isPartyNameDrawerOpen}
        isPending={voucherAction.partyStore.isMutating}
        records={voucherAction.partyStore.records}
        title="Add Party Name"
        onAddRecord={voucherAction.partyStore.addRecord}
        onClose={() => voucherAction.setIsPartyNameDrawerOpen(false)}
        onCreateParty={voucherAction.handleCreateParty}
      />
      <ResponsibilityCenterDrawer
        initialValues={projectInitialValues}
        isOpen={!voucherAction.isReadonly && voucherAction.isProjectNameDrawerOpen}
        mode="add"
        onClose={() => voucherAction.setIsProjectNameDrawerOpen(false)}
        onSaved={voucherAction.handleCreateProject}
      />
      <ResponsibilityCenterDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={voucherAction.handleCloseResponsibilityCenterDrawer}
        onSaved={voucherAction.handleCreateResponsibilityCenter}
      />
      <DefaultAccountDrawer
        isOpen={!voucherAction.isReadonly && voucherAction.isDefaultAccountDrawerOpen}
        mode="add"
        permissions={voucherAction.defaultAccountStore.permissions}
        onClose={() => voucherAction.setIsDefaultAccountDrawerOpen(false)}
      />
    </>
  );
}

function DisbursementVoucherActionSkeleton() {
  return (
    <section className="grid gap-5 p-6">
      <AppSkeletonCard className="grid gap-3 rounded-lg p-5">
        <AppSkeleton className="h-4 w-40" />
        <AppSkeleton className="h-7 w-80 max-w-full" />
        <AppSkeleton className="h-4 w-full max-w-2xl" />
      </AppSkeletonCard>
      <AppSkeletonCard className="grid gap-4 rounded-lg p-5">
        <AppSkeleton className="h-10 w-full" />
        <AppSkeleton className="h-80 w-full rounded-lg" />
      </AppSkeletonCard>
    </section>
  );
}
