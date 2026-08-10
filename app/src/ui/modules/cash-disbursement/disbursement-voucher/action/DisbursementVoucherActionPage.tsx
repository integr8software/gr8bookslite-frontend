"use client";

import { Suspense } from "react";
import type { ReactNode } from "react";
import {
  DisbursementVoucherActionTabs,
  DisbursementVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  DisbursementVoucherCopyFromRecords,
  DisbursementVoucherCopySources,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { useDisbursementVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucherActionPage";
import { BankMasterfileDrawer } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileDrawer";
import { DefaultAccountDrawer } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountDrawer";
import { PaymentTypeDrawer } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { DisbursementVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherActionHeader";
import { VoucherDataEntry } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherDataEntry";
import { DisbursementVoucherDetailsForm } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherDetailsForm";
import { DisbursementVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherFileAttachmentFields";
import { DisbursementVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherNotFound";
import { openDisbursementVoucherPdf } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/reports/DisbursementVoucherPdf";
import { DisbursementVoucherReportPreview } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/reports/DisbursementVoucherReportPreview";
import { AppSkeleton, AppSkeletonCard } from "@/app/src/ui/shared/app/AppSkeleton";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

type DisbursementVoucherActionState = ReturnType<typeof useDisbursementVoucherActionPage>;

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
  voucherAction: DisbursementVoucherActionState;
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

function DisbursementVoucherActionContent({ voucherAction }: { voucherAction: DisbursementVoucherActionState }) {
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
        onSaveDraft={() => voucherAction.submitDisbursementVoucher(DisbursementVoucherStatuses.draft)}
        onSubmit={() => voucherAction.submitDisbursementVoucher(DisbursementVoucherStatuses.forApproval)}
        onUpdateStatus={voucherAction.handleUpdateStatus}
      />
      <ModuleTabs
        activeTab={voucherAction.activeTab}
        ariaLabel="Disbursement voucher sections"
        tabs={DisbursementVoucherActionTabs}
        onTabChange={voucherAction.setActiveTab}
      />
      {voucherAction.activeTab === "details" ? (
        <DisbursementVoucherDetailsSection voucherAction={voucherAction} />
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

function DisbursementVoucherDetailsSection({ voucherAction }: { voucherAction: DisbursementVoucherActionState }) {
  const values = voucherAction.values;

  return (
    <>
      <DisbursementVoucherDetailsForm
        bankAccounts={voucherAction.bankAccounts}
        canAddBankAccount={voucherAction.bankMasterfileStore.permissions.canCreate}
        canAddPartyName={voucherAction.partyStore.permissions.canCreate}
        canAddPaymentType={voucherAction.paymentTypeStore.permissions.canCreate}
        canAddProjectName={false}
        errors={voucherAction.errors}
        isReadonly={voucherAction.isReadonly}
        paymentTypeRecords={voucherAction.paymentTypeStore.paymentTypes}
        values={values}
        onOpenBankAccountDrawer={() => voucherAction.setIsBankMasterfileDrawerOpen(true)}
        onOpenPartyNameDialog={() => voucherAction.setIsPartyNameDrawerOpen(true)}
        onOpenPaymentTypeDrawer={() => voucherAction.setIsPaymentTypeDrawerOpen(true)}
        onOpenProjectNameDialog={() => undefined}
        onPartyChange={voucherAction.handlePartyChange}
        onPaymentTypeChange={voucherAction.handlePaymentTypeChange}
        onUpdateBankAccount={voucherAction.handleBankAccountChange}
        onUpdateField={voucherAction.updateField}
        onUpdatePaymentDetails={voucherAction.updatePaymentDetails}
      />
      <VoucherDataEntry
        bankAccount={voucherAction.selectedBankAccount}
        canAddExpenseType={voucherAction.defaultAccountStore.permissions.canCreate}
        canAddPartyName={voucherAction.partyStore.permissions.canCreate}
        canAddResponsibilityCenter={false}
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
        onAddResponsibilityCenter={() => undefined}
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

function DisbursementVoucherActionDialogs({ voucherAction }: { voucherAction: DisbursementVoucherActionState }) {
  return (
    <>
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
